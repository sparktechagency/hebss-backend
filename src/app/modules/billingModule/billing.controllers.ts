import { Request, Response } from "express";
import asyncHandler from "../../../shared/asyncHandler";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import billingService from "./billing.services";

const getBillings = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page, limit } = req.query;
    const skip = (page as unknown as number - 1) * (limit as unknown as number);
    const billings = await billingService.getBillings(id,skip, parseInt(limit as unknown as string));
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