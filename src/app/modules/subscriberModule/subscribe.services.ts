import { ISubscribe } from "./subscribe.interface";
import Subscribe from "./subscribe.model";

const createSubscribe = async (data: Partial<ISubscribe>) => {
    return await Subscribe.create(data)
}

const getSubscribers = async () => {
    return await Subscribe.find()
}

export default {
    createSubscribe,
    getSubscribers
}