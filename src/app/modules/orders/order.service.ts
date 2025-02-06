import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { Orders } from "./order.model";
import { ICoordinates, IOrder } from "./order.interface";
import { Types } from "mongoose";


const createNewOrder = async (payload: IOrder, files: Express.Multer.File[]): Promise<IOrder> => {

    payload.address = {
        zipCode: "33101",
        streetName: "Example Street",
        streetAddress: "123 Main St",
        city: "Miami",
        state: "FL"
    }
    payload.locations = {
        coordinates: [-77.0369, 38.8075]
    } as ICoordinates;
    payload.serviceIds = [new Types.ObjectId("67a1fe35566b3ace1712af1c")];
    payload.packageIds = [new Types.ObjectId("67a2ec5e4400b9bc11304e8b")];
    payload.linkedAgents = [new Types.ObjectId("67a2ec5e4400b9bc11304e8c")];
    payload.contactInfo = {
        name1: "John Doe",
        email1: "john.doe@example.com",
        phone1: "555-123-4567",
        name2: "Jane Smith",
        email2: "jane.smith@example.com",
        phone2: "555-987-6543"
    }
    payload.schedule = {
        date: new Date(),
        start_time: "10:00 AM",
        end_time: "12:00 PM"
    }

    try {

        if (files && files.length > 0) {
            payload.uploadFiles = files.map((file) => file.path);
        }
        const result = await Orders.create(payload);
        return result;

    } catch (error) {
        console.error("Error creating order or uploading files:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create order or upload files");
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