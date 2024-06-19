import mongoose, { Schema } from "mongoose";

export interface OrderDoc extends Document {
    orderId: string, // 4567887
    vendorId: string,
    items: [any], // [{food, untit: 1}]
    totalAmount: Number, // 345
    orderDate: Date,
    paidThrough: string, // COD, credit card, wallet
    paymentResponses: string // {status: true, response: some bank response}
    orderStatus: string // to determine current status :- waiting, failed, ACCEPT, REJECT, UNDER-PROCESS, READY
    remarks: string
    deliveryId: string
    appliedOffer: boolean
    offerId: string
    readyTime: number // max 60 minutes
} 

const OrderSchema = new Schema({
    orderId: {type: String, required: true}, 
    vendorId: {type: String, required: true}, 
    items: [
        {
            food: {type: Schema.Types.ObjectId, ref: "food", required: true},
            unit: {type: Number, required: true}
        }
    ], 
    totalAmount: Number, 
    orderDate: Date,
    paidThrough: {type: String}, 
    paymentResponses: {type: String}, 
    orderStatus: {type: String},
    remarks: {type: String},
    deliveryId: {type: String},
    appliedOffer: {type: Boolean},
    offerId: {type: String},
    readyTime: {type: Number}
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        }
    },
    timestamps: true
})

const Order = mongoose.model<OrderDoc>('Order', OrderSchema)

export { Order }