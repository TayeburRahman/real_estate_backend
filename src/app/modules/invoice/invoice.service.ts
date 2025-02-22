import httpStatus from "http-status";
import { Package, Service } from "../service/service.model";
import { Orders } from "../orders/order.model";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiError";
import Client from "../client/client.model";
import Member from "../member/member.model";
import { IMember } from "../member/member.interface";


const getOrderServices = async () => {
    try {
        // const services: IService[] = await Service.find({}, "_id title");

        // const orders: IOrder[] = await Orders.find({}, "serviceIds");

        // const serviceCountMap: Record<string, number> = {};

        // orders.forEach((order) => {
        //     order.serviceIds.forEach((serviceId) => {
        //         const idStr = serviceId.toString();
        //         serviceCountMap[idStr] = (serviceCountMap[idStr] || 0) + 1;
        //     });
        // });

        // const result = services.map((service) => ({
        //     title: service.title,
        //     totalOrders: serviceCountMap[service._id.toString()] || 0,
        // }));

        // return result;
    } catch (error: any) {
        throw new ApiError(404, "Failed to fetch order services")
    }
};

export const InvoiceService = {
    getOrderServices
}