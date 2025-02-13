import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { GetAllOrderQuery, IOrder, ISchedule } from "./order.interface";
import { OrdersService } from "./order.service";
import { Types } from "mongoose";


const getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as GetAllOrderQuery;
    const result = await OrdersService.getAllOrders(query as GetAllOrderQuery);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get all order successfully",
        data: result,
    });
});
const createNewOrder = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as IOrder;
    const result = await OrdersService.createNewOrder(body as IOrder, req.files as Express.Multer.File[]);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Create order successfully",
        data: result,
    });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as IOrder;
    const orderId = req.params.orderId as any;
    const result = await OrdersService.updateOrder(orderId as Types.ObjectId, body as IOrder, req.files as Express.Multer.File[]);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Update order successfully",
        data: result,
    });
});

const editServicesOfOrder = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as IOrder;
    const orderId = req.params.orderId as any;
    const result = await OrdersService.editServicesOfOrder(orderId as Types.ObjectId, body as IOrder);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Services update successfully",
        data: result,
    });
});

const setScheduledTime = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as ISchedule;
    const orderId = req.params.orderId as any;
    const result = await OrdersService.setScheduledTime(orderId as Types.ObjectId, body as ISchedule);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Scheduled time update successfully",
        data: result,
    });
})

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId as any;
    const result = await OrdersService.deleteOrder(orderId as Types.ObjectId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order Delete Successfully",
        data: result,
    });
})


export const OrdersController = {
    createNewOrder,
    updateOrder,
    editServicesOfOrder,
    setScheduledTime,
    deleteOrder,
    getAllOrders
}