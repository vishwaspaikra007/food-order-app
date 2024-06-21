import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { CartItems, CreateCustomInputs, CreateDeliveryUserInputs, EditCustomProfileInputs, OrderInputs, UserLoginInputs } from "../dto/Customer.dto";
import { GeneratePassword, GenerateSalt, GenerateSignature, getRandom8DigitNumber, randomNum, ValidatePassword } from "../utility/PasswordUtlility";
import { Customer, CustomerDoc } from "../models/Customer";
import { GenerateOtp, onRequestOtp, verifyOtp } from "../utility";
import { DeliveryUser, Food, Offer, Order, Transaction, TransactionDoc, Vendor } from "../models";

export const DeliveryUserSignup = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body)

    const inputErrors = await validate(deliveryUserInputs, { validationError: { target: true } })

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors)
    }

    const { email, phone, password, firstName, lastName, address, pincode } = deliveryUserInputs

    const salt = await GenerateSalt()

    const userpassword = await GeneratePassword(password, salt)

    const existingDeliveryUser = await DeliveryUser.findOne({ email: email })

    if (existingDeliveryUser !== null) {
        return res.status(409).send({ message: "delivery  user already exist" })
    }

    const result = await DeliveryUser.create({
        email: email,
        password: userpassword,
        salt: salt,
        phone: phone,
        lat: 1,
        lng: 1,
        pincode: pincode,
        firstName: firstName,
        lastname: lastName,
        addresss: address,
        verified: false,
        isAvailable: false
    })


    if (result) {
        // generate the signature

        const signature = GenerateSignature({
            __id: result.id,
            email: result.email,
            verified: result.verified
        })

        // send the result to client

        return res.status(200).json({
            signature: signature,
            verified: result.verified,
            email: result.email
        })
    }

    return res.status(400).send({ message: "error with singup" })
}

export const DeliveryUserLogin = async (req: Request, res: Response, next: NextFunction) => {


    const loginInputs = plainToClass(UserLoginInputs, req.body)

    const loginErrors = await validate(loginInputs, { validationError: { target: true } })
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors)
    }

    const { email, password } = loginInputs

    const deliveryUser = await DeliveryUser.findOne({ email: email })

    if (deliveryUser) {
        const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt)

        if (validation) {
            const signature = GenerateSignature({
                __id: deliveryUser._id as string,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })

            return res.status(400).json({
                signature: signature,
                verified: deliveryUser.verified,
                email: deliveryUser.email
            })
        } else {
            // password didn't match 
        }
    }

    return res.status(400).json({ message: "error with login" })

}


export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user

    if (deliveryUser) {
        const profile = await DeliveryUser.findById(deliveryUser.__id)

        if (profile) {

            return res.status(200).json(profile)
        }
    }

    return res.status(400).json({ message: "error with fetch profile" })
}

export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryuser = req.user

    const profileInputs = plainToClass(EditCustomProfileInputs, req.body)

    const loginErrors = await validate(profileInputs, { validationError: { target: true } })

    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors)
    }

    const { firstName, lastName, address } = profileInputs

    if (deliveryuser) {
        const profile = await DeliveryUser.findById(deliveryuser.__id)

        if (profile) {
            profile.firstName = firstName
            profile.lastname = lastName
            profile.addresss = address

            const result = await profile.save()
            return res.status(200).json(result)
        }
    }

    return res.status(400).json({ message: "error with profile update" })
}

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user

    if(deliveryUser) {
        const { lat, lng } = req.body

        const profile = await DeliveryUser.findById(deliveryUser.__id)

        if(profile) {
            if(lat && lng) {
                profile.lat = lat
                profile.lng = lng

                profile.isAvailable = !profile.isAvailable

                const result = await profile.save()

                return res.status(200).json(result)
            }
        }
    }

    return res.status(400).json({message: "couldn't update status"})
}