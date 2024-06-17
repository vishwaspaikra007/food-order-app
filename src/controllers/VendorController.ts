import { Request, Response, NextFunction, response } from "express";
import { EditVendorInputs, VendorLoginInputs } from "../dto";
import { findVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility/PasswordUtlility";
import { hasOnlyExpressionInitializer } from "typescript";
import { createFoodInputs } from "../dto/Food.dto";
import { Food, FoodDoc, Vendor } from "../models";

export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = <VendorLoginInputs>req.body

    const existingVendor = await findVendor('', email)

    if(existingVendor != null) {
        // console.log(existingVendor)
        const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt)

        if(validation) {

            const signature = GenerateSignature({
                __id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            })

            return res.json(signature)
        }
    }

    return res.json({response: "login credentials incorrect"})
}

export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if(user) {
        const existingVendor = await findVendor(user.__id)

        return res.json(existingVendor)
    }

    return res.json({message: "Vendor information not found"})
}

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const {name, address, phone, foodTypes} = <EditVendorInputs>req.body
    const user = req.user

    if(user) {
        const existingVendor = await findVendor(user.__id)

        if(existingVendor !== null) {
            existingVendor.name = name
            existingVendor.phone = phone
            existingVendor.address = address
            existingVendor.foodType = foodTypes

            const savedResult = await existingVendor.save()

            return res.json(savedResult)
        }

        return res.json(existingVendor)
    }
    
    return res.json({message: "Vendor information not found"})
}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if(user) {
        const existingVendor = await findVendor(user.__id)

        if(existingVendor !== null) {
            
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable
            const savedResult = await existingVendor.save()

            return res.json(savedResult)
        }

        return res.json(existingVendor)
    }
    
    return res.json({message: "Vendor information not found"})
}

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if(user) {

        const vendor = await findVendor(user.__id)

        if(vendor != null) {

            const files = req.files as [Express.Multer.File]

            const images = files.map((file: Express.Multer.File) => file.filename)

            vendor.coverImages.push(...images)
            
            const result = await vendor.save()

            return res.json(result)
        }
    }
    
    return res.json({message: "Something went wrong with add food"})
}

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if(user) {
        const { name, category, description, foodType, readyTime, price} = <createFoodInputs>req.body

        const vendor = await findVendor(user.__id)

        if(vendor != null) {

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
    
    return res.json({message: "Something went wrong with add food"})
}

export const GetFood = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user

    if(user) {
        const food = await Food.find({vendorId: user.__id})

        if(food !== null) {
            return res.json(food)
        }
    }
    
    return res.json({message: "Food information not found"})
}   