import mongoose, { Schema } from "mongoose";

export interface OrderDoc extends Document {
    orderId: string, // 4567887
    vendorId: string,
    items: [any], // [{food, untit: 1}]
    totalAmount: number, // 345
    paidAmount: number,
    orderDate: Date,
    orderStatus: string // to determine current status :- waiting, failed, ACCEPT, REJECT, UNDER-PROCESS, READY
    remarks: string
    deliveryId: string
    readyTime: number // max 60 minutes
    txnId: string
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
    paidAmount: Number,
    orderDate: Date,
    orderStatus: {type: String},
    remarks: {type: String},
    deliveryId: {type: String},
    readyTime: {type: Number},
    txnId: {type: String}
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