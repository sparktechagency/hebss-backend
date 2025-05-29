import { Request, Response } from "express";
import asyncHandler from "../../../shared/asyncHandler";
import subscribeServices from "./subscribe.services";
import CustomError from "../../errors";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createSubscriber = asyncHandler(async(req: Request, res: Response) => {
    const data = req.body;
    const subscriber = await subscribeServices.createSubscribe(data)
    if(!subscriber){
        throw new CustomError.BadRequestError("Failed to create new subscriber!")
    }

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        status: "success",
        message: "Subscriber created",
    })
})

export default {
    createSubscriber
}