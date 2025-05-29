import { Document } from "mongoose";

export interface ISubscribe extends Document{
    email: string;
    subscribe: boolean;
    name: string;
}