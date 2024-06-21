import mongoose, { Schema, Document, Model} from "mongoose";
import { OrderDoc } from "./Order";

export interface DeliveryUserDoc extends Document{
    email: string,
    password: string
    salt: string
    firstName: string
    lastname: string
    addresss: string
    phone: string
    verified: boolean
    pincode: string
    lat: number
    lng: number
    isAvailable: boolean
}

const DeliveryUserSchema = new Schema({
    email: { type: String, required: true},
    password: { type: String, required: true},
    salt: { type: String, required: true},
    firstName: { type: String},
    lastname: { type: String},
    addresss: { type: String},
    phone: { type: String, required: true},
    verified: {type: Boolean, required: true},
    pincode: {type: String},
    lat: {type: Number},
    lng: {type: Number},
    isAvailable: {type: Number}
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
})

const DeliveryUser = mongoose.model<DeliveryUserDoc>('deliveryUser', DeliveryUserSchema)

export { DeliveryUser }