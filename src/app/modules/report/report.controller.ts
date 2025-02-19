import { Request, Response } from "express";
import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { Types } from "mongoose";
import { IReqUser } from "../auth/auth.interface";
import { ReportService } from "./report.service";

const getOrderServices = catchAsync(async (req: Request, res: Response) => {

    const result = await ReportService.getOrderServices();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get services report successfully",
        data: result,
    });
});

const getOrderPackages = catchAsync(async (req: Request, res: Response) => {

    const result = await ReportService.getOrderPackages();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get packages report successfully",
        data: result,
    });
});

const getOrderClientReports = catchAsync(async (req: Request, res: Response) => {

    const result = await ReportService.getOrderClientReports();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get order client report successfully",
        data: result,
    });
});

const getTeamMemberReports = catchAsync(async (req: Request, res: Response) => {

    const result = await ReportService.getTeamMemberReports();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Get team member reports successfully",
        data: result,
    });
});





export const ReportController = {
    getOrderServices,
    getOrderPackages,
    getOrderClientReports,
    getTeamMemberReports
}