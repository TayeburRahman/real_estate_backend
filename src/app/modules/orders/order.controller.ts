import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { GetAllOrderQuery, INotes, IOrder, ISchedule } from "./order.interface";
import { OrdersService } from "./order.service";
import { Types } from "mongoose";
import { IReqUser } from "../auth/auth.interface";


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
    const body = req.body as any;
    const data = JSON.parse(body.data) as IOrder;
    // console.log("data-all", data)
    const user = req.user;
    const result = await OrdersService.createNewOrder(user as IReqUser, data as IOrder, req.files as Express.Multer.File[]);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Create order successfully",
        data: result,
    });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as any;
    const data = JSON.parse(body.data) as IOrder;
    console.log("data-all", body)

    console.log("data-all", data)

    const orderId = req.params.orderId as any;

    const result = await OrdersService.updateOrder(orderId as Types.ObjectId, data as IOrder, req.files as Express.Multer.File[]);
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

const getOrderServices = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.query.orderId as string;
    const clientId = req.query.clientId as string;

    const result = await OrdersService.getOrderServices(orderId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get services successfully",
        data: result,
    });
});

const addOrderNotes = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;
    const body = req.body as INotes;
    const user = req.user as IReqUser;

    const result = await OrdersService.addOrderNotes(orderId, body, user);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Add notes successfully",
        data: result,
    });
});

const getSignalOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;

    const result = await OrdersService.getSignalOrder(orderId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get successfully",
        data: result,
    });
});

const getRecentOrder = catchAsync(async (req: Request, res: Response) => {

    const query = req.query as GetAllOrderQuery;
    const result = await OrdersService.getRecentOrders(query);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get successfully",
        data: result,
    });
})

const needSubmitToday = catchAsync(async (req: Request, res: Response) => {

    const result = await OrdersService.needSubmitToday();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get successfully",
        data: result,
    });
})

const getOrderGrows = catchAsync(async (req: Request, res: Response) => {
    const year = req.query.year || 2025;

    const result = await OrdersService.getOrderGrows(year as number);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get successfully",
        data: result,
    });
})

const getOrderStatusCount = catchAsync(async (req: Request, res: Response) => {

    const result = await OrdersService.getOrderStatusCount();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get successfully",
        data: result,
    });
})



export const OrdersController = {
    createNewOrder,
    updateOrder,
    editServicesOfOrder,
    setScheduledTime,
    deleteOrder,
    getAllOrders,
    getOrderServices,
    addOrderNotes,
    getSignalOrder,
    getRecentOrder,
    needSubmitToday,
    getOrderGrows,
    getOrderStatusCount
}