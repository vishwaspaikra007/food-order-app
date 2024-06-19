// data to Object
export interface  CreateVendorInput {
    name: string,
    ownerName: string
    foodType: [string]
    pincode: string
    address: string
    phone: string
    email: string
    password: string
}

export interface EditVendorInputs {
    name: string
    address: string
    phone: string
    foodTypes: [string]
}

export interface VendorLoginInputs {
    email: string,
    password: string
}

export interface VendorPayload {
    __id: string
    email: string
    name: string
    foodTypes: [string]
}

export interface CreateOfferInputs {
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