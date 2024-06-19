import mongoose, { Schema, Document } from 'mongoose'

export interface OfferDoc extends Document {
    offerType: string // vendor // generic
    vendors: [any]  // ['${VendorId}']
    title: string // INR 200 off on Week Days
    description: string // any descriptions with terms and condition
    minValue: number // minimum order amount should be 300..
    offerAmount: number // 200
    startValidity: Date // 
    endValidity: Date
    promoCode: string // WEEK200
    promoType: string // USER // ALL // BANK // CARD
    banks: [any]
    bins: [any]
    pincode: string // OFFER FOR SPCIFIC AREA
    isActive: boolean
}

const OrderOfferSchema = new Schema({
    offerType: {type: String, require: true},
    vendors: [
        {type: Schema.Types.ObjectId, ref: 'vendor'}
    ],
    title: {type: String, require: true},
    description: {type: String},
    minValue: {type: Number, require: true},
    offerAmount: {type: Number, require: true},
    startValidity: Date,
    endValidity: Date,
    promoCode: {type: String, require: true},
    promoType: {type: String, require: true},
    banks: [
        {type: String}
    ],
    bins: [
        {type: Number}
    ],
    pincode: {type: String, require: true},
    isActive: Boolean,
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
        }
    },
    timestamps: true
})

const Offer = mongoose.model<OfferDoc>('offer', OrderOfferSchema)

export { Offer }