import { Request, Response } from "express";
import asyncHandler from "../../../shared/asyncHandler";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import billingService from "./billing.services";

const getBillings = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;
    const billings = await billingService.getBillings(id,skip, limit);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        status: 'success',
        message: 'Billings retrieved successfully',
        data: billings,
    });
});

export default {
    getBillings
}