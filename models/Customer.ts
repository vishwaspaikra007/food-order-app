import mongoose, { Schema, Document, Model} from "mongoose";

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
}

const CustomerSchema = new Schema<CustomerDoc>({
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
    lng: {type: Number}
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

const Customer: Model<CustomerDoc> = mongoose.model<CustomerDoc>('Customer', CustomerSchema)

export { Customer }