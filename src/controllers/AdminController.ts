import {Request, Response, NextFunction} from 'express'
import { CreateVendorInput } from '../dto'
import { Vendor } from '../models'
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
        foods: []
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