import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IOrder } from "./order.interface";
import { OrdersService } from "./order.service";
import { Types } from "mongoose";


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



export const OrdersController = {
    createNewOrder,
    updateOrder,
    editServicesOfOrder
}