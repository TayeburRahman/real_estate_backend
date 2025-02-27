import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { Orders, Tasks } from "./order.model";
import { CreateTasksInput, GetAllOrderQuery, ICoordinates, INotes, IOrder, ISchedule } from "./order.interface";
import { Types } from "mongoose";
import { Package, PricingGroup } from "../service/service.model";
import { IReqUser } from "../auth/auth.interface";
import { ENUM_TASK_STATUS, ENUM_USER_ROLE } from "../../../enums/user";
import { NotificationService } from "../notifications/notifications.service";


const createNewOrder = async (user: IReqUser, payload: IOrder, files: Express.Multer.File[]) => {
    try {
        // Set default address and location
        // payload.address = {
        //     zipCode: "33101",
        //     streetName: "Example Street",
        //     streetAddress: "123 Main St",
        //     city: "Miami",
        //     state: "FL"
        // };
        // payload.locations = { coordinates: [-77.0369, 38.8075] } as ICoordinates;
        // payload.serviceIds = [new Types.ObjectId("67ad7c72e91fd1ddd9198d46"), new Types.ObjectId("67ad7ca9e91fd1ddd9198d4a")];
        // payload.packageIds = [new Types.ObjectId("67a2ec5e4400b9bc11304e8b"), new Types.ObjectId("67a2ec5e4400b9bc11304e8b"), new Types.ObjectId("67a2ec5e4400b9bc11304e8b"), new Types.ObjectId("67a2ec5e4400b9bc11304e8b")];
        // payload.linkedAgents = [new Types.ObjectId("67a2ec5e4400b9bc11304e8c")];
        // payload.contactInfo = {
        //     name1: "John Doe", email1: "john.doe@example.com", phone1: "555-123-4567",
        //     name2: "Jane Smith", email2: "jane.smith@example.com", phone2: "555-987-6543"
        // };

        const { locations } = payload as any;
        if (!locations.lng || !locations.lat) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Location coordinates are required.");
        }

        payload.locations = {
            type: 'Point',
            coordinates: [locations.lng, locations.lat],
        } as ICoordinates;
        const userType = user.role === ENUM_USER_ROLE.ADMIN ||
            user.role === ENUM_USER_ROLE.MEMBER ||
            user.role === ENUM_USER_ROLE.SUPER_ADMIN ? "Member" : "Client";
        payload.orderPlaced = {
            userId: user.userId,
            userType: userType,
        }
        if (files?.length) {
            payload.uploadFiles = files.map(file => file.path);
        }

        const uniqueServices = new Set(payload.serviceIds);
        if (payload?.packageIds?.length) {
            for (const pkg of payload.packageIds) {
                const getPackage = await Package.findById(pkg);
                if (!getPackage) {
                    throw new ApiError(httpStatus.NOT_FOUND, "One or more packages not found, please choose another package or try again.");
                }
                getPackage.services.forEach(service => uniqueServices.add(service));
            }
        }

        // Create new order
        const order = await Orders.create(payload);
        if (!order) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create order");

        // Create tasks and update order
        const { taskIds } = await createTasks(Array.from(uniqueServices), order._id);
        const updatedOrder = await Orders.findByIdAndUpdate(order._id, { taskIds }, { new: true });

        await NotificationService.sendNotification({
            types: "client",
            orderId: order._id,
            user: payload?.clientId,
            message: `Your order #${order._id} has been successfully placed. We'll notify you once it's processed.`,
            title: "New Order Created"
        });

        return { data: updatedOrder, taskIds };
    } catch (error: any) {
        console.error("Error creating order:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const editServicesOfOrder = async (
    orderId: Types.ObjectId,
    updateData: { serviceIds?: Types.ObjectId[]; packageIds?: Types.ObjectId[] }
) => {
    try {
        const order = await Orders.findById(orderId) as IOrder;
        if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
        let { serviceIds = [], packageIds = [] } = updateData;

        // Find total servicesIds
        // find total existing task
        // Filter(existing task to total servicesIds) missing service id for delete task
        // Filter new servicesIds for create task;
        // Update packages and servicesIds
        // Delete and update tasks id form order


        let totalServices = [...serviceIds];

        if (packageIds?.length) {
            for (const pkg of packageIds) {
                const getPackage = await Package.findById(pkg);
                if (!getPackage) {
                    throw new ApiError(httpStatus.NOT_FOUND, "One or more packages not found, please choose another package or try again.");
                }
                getPackage.services.forEach((service: any) => totalServices.push(service.toString()));
            }
        }

        const existingTasks = await Tasks.find({ orderId });
        const existingTaskServiceIds = [] as string[];
        for (const ext of existingTasks) {
            const getSid = ext.serviceId;
            if (!getSid) {
                throw new ApiError(httpStatus.NOT_FOUND, "One or more Task service id not found, please try again.");
            }
            existingTaskServiceIds.push(getSid.toString());
        }

        const removedServicesTask = [...existingTaskServiceIds].filter((serviceId: any) => !totalServices.includes(serviceId.toString()));

        if (removedServicesTask.length > 0) {
            await Tasks.deleteMany({ orderId, serviceId: { $in: removedServicesTask } });
        }

        const newServices = [...totalServices].filter(serviceId => !existingTaskServiceIds.includes(serviceId.toString()));
        let newTaskIds = [] as Object;
        if (newServices.length > 0) {
            const { taskIds } = await createTasks(newServices, orderId);
            newTaskIds = taskIds;
        }

        if (removedServicesTask.length) {
            await Orders.findByIdAndUpdate(orderId, {
                $pull: { taskIds: { $in: removedServicesTask } }
            });
        }

        const tasksData = await Tasks.find({ orderId });
        let tasksId = [] as string[];

        if (tasksData.length > 0) {
            for (const ids of tasksData) {
                tasksId.push(ids._id.toString());
            }
        }

        // need duplicate id stay 
        if (totalServices.length > 0) {
            for (const serviceId of totalServices) {
                const tasks = await Tasks.find({ orderId, serviceId }).sort({ _id: 1 });

                if (tasks.length > 1) {
                    const taskIdsToDelete = tasks.slice(1).map(task => task._id);
                    await Tasks.deleteMany({ _id: { $in: taskIdsToDelete } });
                }
            }
        }

        const updatedOrder = await Orders.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    serviceIds: Array.from(serviceIds),
                    packageIds: packageIds,
                    taskIds: tasksId
                },

            },
            { new: true }
        );

        if (!updatedOrder) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update order");

        return { data: updatedOrder, taskIds: updatedOrder.taskIds };
    } catch (error: any) {
        console.error("Error updating order:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const createTasks = async (uniqueServices: Types.ObjectId[], orderId: Types.ObjectId) => {
    try {
        const tasksToInsert = uniqueServices.map(serviceId => ({ serviceId, orderId }));
        const taskResult = await Tasks.insertMany(tasksToInsert);
        return { taskIds: taskResult.map(task => task._id) };
    } catch (error) {
        console.error("Error creating tasks:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create tasks");
    }
};
// --
const updateOrder = async (orderId: Types.ObjectId, updateData: Partial<IOrder>, files?: Express.Multer.File[]) => {
    try {
        const { taskIds, packageIds, serviceIds, schedule, ...allowedUpdates } = updateData;

        if (files?.length) {
            allowedUpdates.uploadFiles = [
                ...(updateData.uploadFiles || []),
                ...files.map(file => file.path)
            ];
        }

        const updatedOrder = await Orders.findByIdAndUpdate(
            orderId,
            { $set: allowedUpdates },
            { new: true }
        );

        if (!updatedOrder) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");

        return { data: updatedOrder };
    } catch (error: any) {
        console.error("Error updating order:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const setScheduledTime = async (orderId: Types.ObjectId, payload: ISchedule) => {

    if (!payload.date || !payload.end_time || !payload.start_time) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields for schedule");
    }
    const order = await Orders.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }
    const { date, start_time, end_time, memberId } = payload;
    const scheduleDate = new Date(date);
    let title = "Scheduled Order";
    let message = `Order has been scheduled for ${scheduleDate.toDateString()}.`;

    if (order?.schedule?.date) {
        title = "Rescheduled Order";
        message = `Your order has been rescheduled to ${scheduleDate.toDateString()}.`;
    }


    const result = await Orders.findByIdAndUpdate(orderId, {
        $set: {
            schedule: {
                date: scheduleDate,
                start_time,
                end_time,
                memberId: memberId
            },
        },
    }, { new: true })

    await Tasks.updateMany(
        { orderId: orderId },
        {
            $set: {
                schedule_memberId: memberId,
                status: "Scheduled"
            }
        });


    await NotificationService.sendNotification({
        types: "client",
        orderId: order._id,
        user: order?.clientId,
        message: message,
        title: title
    });

    await NotificationService.sendNotification({
        types: "member",
        orderId: order._id,
        user: memberId,
        message: message,
        isAdmin: true,
        title: title
    });

    return result;
}

const deleteOrder = async (orderId: Types.ObjectId) => {
    if (!orderId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order ID");
    }
    const result = await Orders.findByIdAndDelete(orderId);
    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }
    return result;
}

const getAllOrders = async (query: GetAllOrderQuery) => {
    const { searchTerm, status, paymentStatus, page = 1, limit = 10 } = query;

    const matchStage: any = {};

    if (status) {
        matchStage["status"] = status;
    }

    if (paymentStatus) {
        matchStage["paymentStatus"] = paymentStatus;
    }

    if (searchTerm) {
        matchStage["client.name"] = { $regex: searchTerm, $options: "i" };
    }

    const orders = await Orders.aggregate([
        {
            $lookup: {
                from: "clients",
                localField: "clientId",
                foreignField: "_id",
                as: "client"
            }
        },
        { $unwind: "$client" },
        { $match: matchStage },
        {
            $project: {
                _id: 1,
                orderDate: "$createdAt",
                "client.name": 1,
                "client.profile_image": 1,
                "address.streetAddress": 1,
                "address.city": 1,
                "address.state": 1,
                servicesCount: { $size: "$serviceIds" },
                totalAmount: 1,
                appointment: {
                    $concat: [
                        { $dateToString: { format: "%m/%d/%Y", date: "$schedule.date" } }, // Fixed format
                        " at ",
                        "$schedule.start_time"
                    ]
                },
                status: 1,
                paymentStatus: 1
            }
        },
        // @ts-ignore
        { $skip: (page - 1) * limit },
        // @ts-ignore
        { $limit: limit }
    ]);

    const totalCount = await Orders.aggregate([
        {
            $lookup: {
                from: "clients",
                localField: "clientId",
                foreignField: "_id",
                as: "client"
            }
        },
        { $unwind: "$client" },
        { $match: matchStage },
        { $count: "total" }
    ]);

    return {
        meta: {
            total: totalCount[0]?.total || 0,
            page,
            limit,
            // @ts-ignore
            totalPages: Math.ceil((totalCount[0]?.total || 0) / limit),
        },
        data: orders.reverse()
    };
};

const getOrderServices = async (orderId: string) => {
    if (!orderId) {
        throw new ApiError(404, 'Invalid Order ID');
    }

    let order = await Orders.findById(orderId)
        .select('packageIds _id serviceIds totalAmount')
        .populate({
            path: 'packageIds',
            populate: {
                path: 'services',
                select: "title _id"
            }
        })
        .populate({
            path: 'serviceIds',
            select: "title _id price descriptions service_image",
            populate: ({
                path: 'category',
                select: "name",
            })
        })
        .lean();

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    if (order.serviceIds?.length) {
        const groups = await PricingGroup.find({ clients: order.clientId }).lean();
        // @ts-ignore
        order.serviceIds = order.serviceIds.map((service) => {
            const matchedGroup = groups.find(group =>
                group.services.some(s => s.serviceId.toString() === service._id.toString())
            );

            if (matchedGroup) {
                const specialService = matchedGroup.services.find(s => s.serviceId.toString() === service._id.toString());

                if (specialService && typeof specialService.special_price !== "undefined" && specialService.special_price !== null) {
                    return { ...service, price: specialService.special_price };
                }
            }
            return service;
        });
    }

    return order;
};

const addOrderNotes = async (orderId: string, payload: INotes, user: IReqUser) => {
    if (!orderId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order ID");
    }

    const data = {
        text: payload.text,
        memberId: user.userId,
        date: new Date()
    }

    const result = await Orders.findByIdAndUpdate(
        orderId,
        { $push: { notes: data } },
        { new: true }
    );

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    return result;
}

const getSignalOrder = async (orderId: string) => {
    if (!orderId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order ID");
    }

    const result = await Orders.findById(orderId)
        .populate('clientId packageIds serviceIds linkedAgents')
        .populate({
            path: 'taskIds',
            select: 'name status serviceId ',
            populate: {
                path: 'serviceId finishFile',
                select: '_id title'
            }
        })
        .populate({
            path: 'orderPlaced',
            populate: {
                path: 'userId',
                select: '_id name profile_image role'
            }
        })
        .populate({
            path: 'notes',
            populate: {
                path: 'memberId',
                select: '_id name profile_image role'
            }
        })

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
    }

    return result;
}

const updateStatusOrder = async (query: { status: string; taskId: string }) => {
    // const task = await Orders.findById(query.taskId);
    // if (!task) {
    //     throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
    // }

    // if (!Object.values(ENUM_TASK_STATUS).includes(query.status as ENUM_TASK_STATUS)) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid task status");
    // }

    // task.status = query.status as ENUM_TASK_STATUS;
    // await task.save();

    // return task.status;
};

// Home Dashboard===================================
const getRecentOrders = async (query: GetAllOrderQuery) => {
    const { searchTerm, status, page = 1, limit = 10 } = query;

    const orders = await Orders.aggregate([
        {
            $match: status ? { status } : {}
        },
        {
            $lookup: {
                from: "clients",
                localField: "clientId",
                foreignField: "_id",
                as: "client"
            }
        },
        {
            $unwind: {
                path: "$client",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "orderId",
                as: "tasks"
            }
        },
        {
            $addFields: {
                totalTasks: { $size: "$tasks" }
            }
        },
        {
            $project: {
                _id: 1,
                orderId: "$_id",
                "client.name": 1,
                "client.profile_image": 1,
                address: 1,
                totalTasks: 1,
                status: 1,
                createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) }
    ]);

    const totalOrders = await Orders.countDocuments(status ? { status } : {});

    return {
        data: orders,
        meta: {
            totalOrders,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalOrders / Number(limit))
        }
    };
};

const needSubmitToday = async () => {
    const now = new Date();

    const netherlandsOffset = 1 * 60 * 60 * 1000;
    const today = new Date(now.getTime() + netherlandsOffset);
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    console.log(today, tomorrow);

    const todayOrders = await Orders.find({
        "schedule.date": { $gte: today, $lt: tomorrow }
    }).populate("")
        .select("schedule.date status address ")

    if (!todayOrders.length) return todayOrders;

    const orderIds = todayOrders.map(order => order._id);
    const tasks = await Tasks.aggregate([
        { $match: { orderId: { $in: orderIds } } },
        {
            $group: {
                _id: "$orderId",
                totalTasks: { $sum: 1 }
            }
        }
    ]);

    const taskCounts = tasks.reduce((acc, task) => {
        acc[task._id.toString()] = task.totalTasks;
        return acc;
    }, {});


    return todayOrders.map(order => ({
        order,
        totalTasks: taskCounts[order._id.toString()] || 0
    }));

};

const getYearRange = (year: any) => {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    return { startDate, endDate };
};

const getOrderGrows = async (year?: number) => {
    try {
        const currentYear = new Date().getFullYear();
        const selectedYear = year || currentYear;

        const { startDate, endDate } = getYearRange(selectedYear);

        const monthlyDriverGrowth = await Orders.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id.month',
                    year: '$_id.year',
                    count: 1,
                },
            },
            {
                $sort: { month: 1 },
            },
        ]);

        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const result = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlyDriverGrowth.find(
                data => data.month === i + 1,
            ) || {
                month: i + 1,
                count: 0,
                year: selectedYear,
            };
            return {
                ...monthData,
                month: months[i],
            };
        });

        return {
            year: selectedYear,
            data: result,
        };
    } catch (error: any) {
        console.error('Error in getDriverGrowth function: ', error);
        throw new ApiError(404, error.message);;
    }
};

const getOrderStatusCount = async () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Amsterdam",
    });

    const now = new Date();
    const netherlandsDate = new Date(formatter.format(now));
    netherlandsDate.setHours(0, 0, 0, 0);

    const tomorrow = new Date(netherlandsDate);
    tomorrow.setDate(netherlandsDate.getDate() + 1);

    const todayOrdersCount = await Orders.countDocuments({
        "schedule.date": { $gte: netherlandsDate, $lt: tomorrow },
    });

    const pendingOrdersCount = await Orders.countDocuments({
        status: "Progress",
    });


    const completeOrdersCount = await Orders.countDocuments({
        status: "Completed",
    });
    const totalOrdersCount = await Orders.countDocuments({});

    return {
        todayOrders: todayOrdersCount,
        pendingOrders: pendingOrdersCount,
        completeOrders: completeOrdersCount,
        totalOrders: totalOrdersCount,
    };
};


export const OrdersService = {
    createNewOrder,
    updateOrder,
    editServicesOfOrder,
    setScheduledTime,
    deleteOrder,
    getAllOrders,
    getOrderServices,
    addOrderNotes,
    getSignalOrder,
    updateStatusOrder,
    getRecentOrders,
    needSubmitToday,
    getOrderGrows,
    getOrderStatusCount
}
