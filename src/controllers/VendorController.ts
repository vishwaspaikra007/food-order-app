import { Request, Response, NextFunction, response } from "express";
import { CreateOfferInputs, EditVendorInputs, VendorLoginInputs } from "../dto";
import { findVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility/PasswordUtlility";
import { hasOnlyExpressionInitializer } from "typescript";
import { createFoodInputs } from "../dto/Food.dto";
import { Food, FoodDoc, Offer, Order, Vendor } from "../models";

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = <VendorLoginInputs>req.body

    const existingVendor = await findVendor('', email)

    if (existingVendor != null) {
        // console.log(existingVendor)
        const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt)

        if (validation) {

            const signature = GenerateSignature({
                __id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            })

            return res.json(signature)
        }
    }

    return res.json({ response: "login credentials incorrect" })
}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (user) {
        const existingVendor = await findVendor(user.__id)

        return res.json(existingVendor)
    }

    return res.json({ message: "Vendor information not found" })
}

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const { name, address, phone, foodTypes } = <EditVendorInputs>req.body
    const user = req.user

    if (user) {
        const existingVendor = await findVendor(user.__id)

        if (existingVendor !== null) {
            existingVendor.name = name
            existingVendor.phone = phone
            existingVendor.address = address
            existingVendor.foodType = foodTypes

            const savedResult = await existingVendor.save()

            return res.json(savedResult)
        }

        return res.json(existingVendor)
    }

    return res.json({ message: "Vendor information not found" })
}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user
    const {lat, lng} = req.body

    if (user) {
        const existingVendor = await findVendor(user.__id)

        if (existingVendor !== null) {

            existingVendor.serviceAvailable = !existingVendor.serviceAvailable

            if(lat && lng) {
                existingVendor.lat = lat
                existingVendor.lng = lng
            }

            const savedResult = await existingVendor.save()  

            return res.json(savedResult)
        }

        return res.json(existingVendor)
    }

    return res.json({ message: "Vendor information not found" })
}

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if (user) {

        const vendor = await findVendor(user.__id)

        if (vendor != null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)

            vendor.coverImages.push(...images)

            const result = await vendor.save()

            return res.json(result)
        }
    }

    return res.json({ message: "Something went wrong with add food" })
}

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if (user) {
        const { name, category, description, foodType, readyTime, price } = <createFoodInputs>req.body

        const vendor = await findVendor(user.__id)

        if (vendor != null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)

            const createdFood = await Food.create({
                vendorId: vendor.id,
                name: name,
                category: category,
                description: description,
                foodType: foodType,
                readyTime: readyTime,
                images: images,
                price: price,
                rating: 0
            } as createFoodInputs)

            vendor.foods.push(createdFood)

            const result = await vendor.save()

            return res.json(result)
        }
    }

    return res.json({ message: "Something went wrong with add food" })
}

export const GetFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if (user) {
        const food = await Food.find({ vendorId: user.__id })

        if (food !== null) {
            return res.json(food)
        }
    }

    return res.json({ message: "Food information not found" })
}

export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if (user) {
        const orders = await Order.find({ vendorId: user.__id }).populate('items.food')

        if (orders) {
            return res.status(200).json(orders)
        }
    }

    return res.status(400).json({ message: "order not found" })
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id

    if (orderId) {
        const order = await Order.findById(orderId).populate('items.food')

        if (order) {
            return res.status(200).json(order)
        }
    }

    return res.status(400).json({ message: "order not found" })
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id

    const { status, remark, time } = req.body

    if (orderId) {
        const order = await Order.findById(orderId).populate('items.food')

        if (order) {
            order.orderStatus = status
            order.remarks = remark
            if (time) order.readyTime = time

            const orderResult = await order.save()

            if (orderResult) {
                return res.status(200).json(orderResult)
            }
        }
    }
    return res.status(400).json({ message: "unable to process order" })
}

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (user) {
        const offers = await Offer.find().populate('vendors')

        if (offers) {
            let currentOffers = Array()

            offers.map((item) => {
                if (item.vendors) {
                    item.vendors.map(vendor => {
                        if (vendor._id.toString() === user.__id) {
                            currentOffers.push(item)
                        }
                    })
                }
                if (item.offerType === "GENERIC") {
                    currentOffers.push(item)
                }
            })

            return res.status(200).json(currentOffers)
        }
    }
    return res.status(400).json({ message: "unable to get offers" })
}

export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (user) {
        const {
            offerType,
            title,
            description,
            minValue,
            offerAmount,
            startValidity,
            endValidity,
            promoCode,
            promoType,
            banks,
            bins,
            pincode,
            isActive,
        } = <CreateOfferInputs>req.body

        const vendor = await Vendor.findById(user.__id)

        if (vendor) {
            const offer = await Offer.create({
                offerType,
                vendors: [vendor],
                title,
                description,
                minValue,
                offerAmount,
                startValidity,
                endValidity,
                promoCode,
                promoType,
                banks,
                bins,
                pincode,
                isActive,
            })

            return res.status(200).json(offer)
        }
    }
    return res.status(400).json({ message: "unable to Add Offer" })
}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const offerId = req.params.id

    if (user) {
        const {
            offerType,
            title,
            description,
            minValue,
            offerAmount,
            startValidity,
            endValidity,
            promoCode,
            promoType,
            banks,
            bins,
            pincode,
            isActive,
        } = <CreateOfferInputs>req.body

        const currentOffer = await Offer.findById(offerId)

        if (currentOffer) {
            const vendor = await Vendor.findById(user.__id)

            if (vendor) {
                currentOffer.offerType = offerType
                currentOffer.title = title
                currentOffer.description = description
                currentOffer.minValue = minValue
                currentOffer.offerAmount = offerAmount
                currentOffer.startValidity = startValidity
                currentOffer.endValidity = endValidity
                currentOffer.promoCode = promoCode
                currentOffer.promoType = promoType
                currentOffer.banks = banks
                currentOffer.bins = bins
                currentOffer.pincode = pincode
                currentOffer.isActive = isActive
                
                const result = await currentOffer.save()
                return res.status(200).json(result)
            }
        }


    }
    return res.status(400).json({ message: "unable to Add Offer" })
}