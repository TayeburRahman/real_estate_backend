import httpStatus from "http-status";
import { Package, Service } from "../service/service.model";
import { Orders } from "../orders/order.model";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiError";
import Client from "../client/client.model";
import { IClient, IOrder, IPackage, IService } from "./report.interface";
import Member from "../member/member.model";
import { IMember } from "../member/member.interface";

const getOrderServices = async () => {
    try {
        const services: IService[] = await Service.find({}, "_id title");

        const orders: IOrder[] = await Orders.find({}, "serviceIds");

        const serviceCountMap: Record<string, number> = {};

        orders.forEach((order) => {
            order.serviceIds.forEach((serviceId) => {
                const idStr = serviceId.toString();
                serviceCountMap[idStr] = (serviceCountMap[idStr] || 0) + 1;
            });
        });

        const result = services.map((service) => ({
            title: service.title,
            totalOrders: serviceCountMap[service._id.toString()] || 0,
        }));

        return result;
    } catch (error: any) {
        throw new ApiError(404, "Failed to fetch order services")
    }
};

const getOrderPackages = async () => {
    try {
        const packages: IPackage[] = await Package.find({}, "_id name");

        const orders: IOrder[] = await Orders.find({}, "packageIds");

        const packageCountMap: Record<string, number> = {};

        orders.forEach((order) => {
            order.packageIds.forEach((packageId) => {
                const idStr = packageId.toString();
                packageCountMap[idStr] = (packageCountMap[idStr] || 0) + 1;
            });
        });

        const result = packages.map((pkg) => ({
            packageName: pkg.name,
            totalOrders: packageCountMap[pkg._id.toString()] || 0,
        }));

        return result;
    } catch (error) {
        throw new ApiError(404, "Failed to fetch order packages")
    }
};

const getOrderClientReports = async () => {
    try {
        const clients: IClient[] = await Client.find({}, "name phoneNumber address");

        const orders: IOrder[] = await Orders.find({}, "clientId totalAmount");

        const clientReports = clients.map((client) => {
            const clientOrders = orders.filter((order) => order.clientId.toString() === client._id.toString());

            const totalOrders = clientOrders.length;
            const totalRevenue = clientOrders.reduce((sum, order) => sum + order.totalAmount, 0);

            return {
                companyName: client.name,
                phoneNumber: client.phoneNumber,
                address: client.address,
                totalOrders,
                revenue: `$${totalRevenue.toLocaleString()}`,
            };
        });

        return clientReports;
    } catch (error) {
        throw new ApiError(404, "Failed to fetch client reports")
    }
};

const getTeamMemberReports = async () => {
    try {
        const members: IMember[] = await Member.find({});

        const orders: any[] = await Orders.find({}, "schedule totalAmount");

        const memberReports = members.map((member: any) => {
            const memberOrders = orders.filter((order) =>
                order.schedule.memberId.some((id: any) => id.toString() === member._id.toString())
            );
            const totalAppointments = memberOrders.length;

            return {
                memberId: member._id,
                name: member.name,
                role: member.roleOfName || member.role,
                email: member.email,
                phoneNumber: member.phone_number,
                totalAppointments,
            };
        });

        return memberReports;
    } catch (error) {
        console.error(error);
        throw new ApiError(404, "Failed to fetch team member reports");
    }
};

export const ReportService = {
    getOrderServices,
    getOrderPackages,
    getOrderClientReports,
    getTeamMemberReports
}