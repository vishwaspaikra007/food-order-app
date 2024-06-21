import {Request, Response, NextFunction} from 'express'
import { CreateVendorInput } from '../dto'
import { DeliveryUser, Transaction, Vendor } from '../models'
import { GeneratePassword, GenerateSalt } from '../utility/PasswordUtlility'

export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
    const { name, address, pincode, foodType, email, password, ownerName, phone } = <CreateVendorInput>req.body

    const existingUser = await Vendor.findOne({email: email})

    if(existingUser != null) {
        console.log("vendor already exist")
        return res.json({response: `A user with this email ID ${email} already exist`})
    }

    // generate a salt
    // encrypt the password using salt

    const salt = await GenerateSalt()
    const pwd = await GeneratePassword(password, salt)

    const createdVendor = await Vendor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: pwd,
        ownerName: ownerName,
        phone: phone,
        salt: salt,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        foods: [],
        lat: 0,
        lng: 0,
    })
    console.log("vendor created successflly")
    return res.json(createdVendor)
}

export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
    const vendors = await Vendor.find()

    if(vendors != null) {
        return res.json(vendors)
    }

    return res.json({response: "Vendor data not available"})
}

export const findVendor = async (id: string | undefined, email?:string) => {
    if(email) {
        return await Vendor.findOne({email: email})
    } else {
        return await Vendor.findById(id)
    }
}

export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {

    const vendorID = req.params.id
    const vendor = findVendor(vendorID)

    if(vendor != null) {
        return res.json(vendor)
    }

    return res.json({response: `no user with given ID: ${vendorID}`})
}

export const GetTransactions = async (req: Request, res: Response, next: NextFunction) => {
    const transactions = await Transaction.find()

    if(transactions) {
        return res.status(200).json(transactions)
    }

    return res.status(404).json({message: "transactions not found"})
}

export const GetTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const transaction = await Transaction.findById(id)

    if(transaction) {
        return res.status(200).json(transaction)
    }

    return res.status(404).json({message: "transaction not found"})
}

export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction) => {
    const { _id, status } = req.body
    
    if(_id) {
        const profile = await DeliveryUser.findById(_id)

        if(profile) {
            profile.verified = status

            const result = await profile.save()

            return res.status(200).json(result)
        }
    }

    return res.status(400).json({message: "Unable to verify delivery user"})
}

export const GetDeliveryUsers = async (req: Request, res: Response, next: NextFunction) => {
    
    const deliveryUsers = await DeliveryUser.find()

    if(deliveryUsers) {
        return res.status(200).json(deliveryUsers)
    }

    return res.status(400).json({message: "Unable to get delivery users"})
}