import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { InvoiceService } from "./invoice.service";
import { IInvoice } from "./invoice.interface";
import { IReqUser } from "../auth/auth.interface";

const createOrderInvoice = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as IInvoice;
    const user = req.user as IReqUser;
    const result = await InvoiceService.createOrderInvoice(body, user);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Create invoice successfully",
        data: result,
    });
});

const getClientOrderInvoice = catchAsync(async (req: Request, res: Response) => {
    const query = {
        clientId: req.query.clientId as string,
        searchTerm: req.query.searchTerm as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
    };
    const user = req.user as IReqUser;
    const result = await InvoiceService.getClientOrderInvoice(query, user);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Create invoice successfully",
        data: result,
    });
});


const createCheckoutSessionStripe = catchAsync(async (req: Request, res: Response) => {
    const result = await InvoiceService.createCheckoutSessionStripe(req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Create Checkout Session Successfully",
        data: result,
    });
});

const stripeCheckAndUpdateStatusSuccess = catchAsync(async (req: Request, res: Response) => {
    const result = await InvoiceService.stripeCheckAndUpdateStatusSuccess(req);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Update Session Successfully",
        data: result,
    });
});







export const InvoiceController = {
    createOrderInvoice,
    getClientOrderInvoice,
    createCheckoutSessionStripe,
    stripeCheckAndUpdateStatusSuccess
}