import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { Orders, Tasks } from "./order.model";
import { CreateTasksInput, GetAllOrderQuery, ICoordinates, IOrder, ISchedule } from "./order.interface";
import { Types } from "mongoose";
import { Package } from "../service/service.model";
import QueryBuilder from "../../../builder/QueryBuilder";


const createNewOrder = async (payload: IOrder, files: Express.Multer.File[]) => {
    try {
        // Set default address and location
        payload.address = {
            zipCode: "33101",
            streetName: "Example Street",
            streetAddress: "123 Main St",
            city: "Miami",
            state: "FL"
        };
        payload.locations = { coordinates: [-77.0369, 38.8075] } as ICoordinates;
        payload.serviceIds = [new Types.ObjectId("67a1fe35566b3ace1712af1c"), new Types.ObjectId("67a20593adf11bd2f5cc53fb")];
        payload.packageIds = [new Types.ObjectId("67a2ec5e4400b9bc11304e8b"), new Types.ObjectId("67a2ec5e4400b9bc11304e8b"), new Types.ObjectId("67a2ec5e4400b9bc11304e8b"), new Types.ObjectId("67a2ec5e4400b9bc11304e8b")];
        payload.linkedAgents = [new Types.ObjectId("67a2ec5e4400b9bc11304e8c")];
        payload.contactInfo = {
            name1: "John Doe", email1: "john.doe@example.com", phone1: "555-123-4567",
            name2: "Jane Smith", email2: "jane.smith@example.com", phone2: "555-987-6543"
        };

        // Handle file uploads
        if (files?.length) {
            payload.uploadFiles = files.map(file => file.path);
        }

        // Collect unique services from packages
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
            allowedUpdates.uploadFiles = files.map(file => file.path);
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
    const { date, start_time, end_time } = payload;
    const scheduleDate = new Date(date);

    const result = await Orders.findByIdAndUpdate(orderId, {
        $set: {
            schedule: {
                date: scheduleDate,
                start_time,
                end_time,
            },
        },
    }, { new: true })

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
    const userQuery = new QueryBuilder(Orders.find()
        .populate({ path: "clientId", select: "name profile_image" })
        , query)
        .search(["clientId.name"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await userQuery.modelQuery;
    const meta = await userQuery.countTotal();

    return {
        meta,
        data: result,
    };
}




export const OrdersService = {
    createNewOrder,
    updateOrder,
    editServicesOfOrder,
    setScheduledTime,
    deleteOrder,
    getAllOrders
}















// if (files) {
//     const uploadFiles = files.map(result => ({
//         url: result.path,
//     }));
//     payload.uploadFiles = uploadFiles;
// }