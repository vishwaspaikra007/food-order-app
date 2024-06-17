import mongoose, { Schema, Document, Model} from "mongoose";
import { OrderDoc } from "./Order";

export interface CustomerDoc extends Document{
    email: string,
    password: string
    salt: string
    firstName: string
    lastname: string
    addresss: string
    phone: string
    verified: boolean
    otp: number
    otp_expiry: Date
    lat: number
    lng: number
    cart: [any]
    Orders: [OrderDoc]
}

const CustomerSchema = new Schema({
    email: { type: String, required: true},
    password: { type: String, required: true},
    salt: { type: String, required: true},
    firstName: { type: String},
    lastname: { type: String},
    addresss: { type: String},
    phone: { type: String, required: true},
    verified: {type: Boolean, required: true},
    otp: {type: Number, required: true},
    otp_expiry: {type: Date, required: true},
    lat: {type: Number},
    lng: {type: Number},
    cart: [{
        food: {type: Schema.Types.ObjectId, ref: 'food', required: true},
        unit: {type: Number, required: true}
    }],
    Orders: [
        {
            type: Schema.Types.ObjectId,
            ref: "Order"
        }
    ]
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

const Customer = mongoose.model<CustomerDoc>('Customer', CustomerSchema)

export { Customer }