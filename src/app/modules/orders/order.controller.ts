import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IOrder } from "./order.interface";
import { OrdersService } from "./order.service";


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


export const OrdersController = {
    createNewOrder
}