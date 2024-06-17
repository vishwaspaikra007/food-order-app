import mongoose, { Schema } from "mongoose";

export interface OrderDoc extends Document {
    orderId: string, // 4567887
    items: [any], // [{food, untit: 1}]
    totalAmount: Number, // 345
    orderDate: Date,
    paidThrough: string, // COD, credit card, wallet
    paymentResponses: string // {status: true, response: some bank response}
    orderStatus: string

} 

const OrderSchema = new Schema({
    orderId: {type: String, required: true}, 
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
    orderStatus: {type: String}
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