import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { Orders, Tasks } from "./order.model";
import { CreateTasksInput, ICoordinates, IOrder } from "./order.interface";
import { Types } from "mongoose";
import { Package } from "../service/service.model";


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


export const OrdersService = {
    createNewOrder
}















// if (files) {
//     const uploadFiles = files.map(result => ({
//         url: result.path,
//     }));
//     payload.uploadFiles = uploadFiles;
// }