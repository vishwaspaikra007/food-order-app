import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { CreateCustomInputs, EditCustomProfileInputs, UserLoginInputs } from "../dto/Customer.dto";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utility/PasswordUtlility";
import { Customer, CustomerDoc } from "../models/Customer";
import { GenerateOtp, onRequestOtp, verifyOtp } from "../utility";

export const CustomerSignup = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(CreateCustomInputs, req.body)

    const inputErrors = await validate(customerInputs, { validationError: { target: true } })

    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors)
    }

    const { email, phone, password } = customerInputs

    const salt = await GenerateSalt()

    const userpassword = await GeneratePassword(password, salt)

    const { otp, expiry } = GenerateOtp()

    const existingUser = await Customer.findOne({ email: email })

    if (existingUser !== null) {
        return res.status(409).send({ message: "user already exist" })
    }

    const result = await Customer.create({
        email: email,
        password: userpassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        lat: 1,
        lng: 1,
        firstName: '',
        lastname: '',
        addresss: '',
        verified: false,
    })

    if (result) {
        // send OTP to customer
        try {
            await onRequestOtp(phone)
        } catch (err) {
            console.log(err)
            return res.status(400).send({ message: "error in signup" })
        }

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

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {


    const loginInputs = plainToClass(UserLoginInputs, req.body)

    const loginErrors = await validate(loginInputs, { validationError: {target: true}})
    if(loginErrors.length > 0) {
        return res.status(400).json(loginErrors)
    }

    const {email, password} = loginInputs

    const customer = await Customer.findOne({email: email})

    if(customer) {
        const validation = await ValidatePassword(password, customer.password, customer.salt)
        
        if(validation) {
            const signature = GenerateSignature({
                __id: customer._id,
                email: customer.email,
                verified: customer.verified
            })

            return res.status(400).json({
                signature: signature,
                verified: customer.verified,
                email: customer.email
            })
        } else {
            // password didn't match 
        }
    }

    return res.status(400).json({message: "error with login"})

}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    const { otp } = req.body
    const customer = req.user

    if (customer) {
        const profile = await Customer.findById(customer.__id)

        if (profile) {

            const isVerified = await verifyOtp(profile.phone, otp)

            if (isVerified == true) {
                profile.verified = true
                
                const updatedCustomerResponse = await profile.save()

                const signature = GenerateSignature({
                    __id: updatedCustomerResponse.id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                })

                return res.status(200).json({
                    signature: signature,
                    verified: updatedCustomerResponse.verified,
                    email: updatedCustomerResponse.email
                })
            }
        }
    }

    return res.status(400).json({message: "error with OTP request"})
}

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if(customer) {
        const profile = await Customer.findById(customer.__id)

        if(profile) {
            try {
                await onRequestOtp(profile.phone)
            } catch (err) {
                console.log(err)
                return res.status(400).send({ message: "error in signup" })
            }

            res.status(200).json({message: "Otp sent to your registered phone"})
        }
    }
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    if(customer) {
        const profile = await Customer.findById(customer.__id)
        
        if(profile) {

            return res.status(200).json(profile)
        }
    }

    return res.status(400).json({message: "error with fetch profile"})
}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    const profileInputs = plainToClass(EditCustomProfileInputs, req.body)

    const loginErrors = await validate(profileInputs, { validationError: {target: true}})

    if(loginErrors.length > 0) {
        return res.status(400).json(loginErrors)
    }

    const {firstName, lastName, address} = profileInputs

    if(customer) {
        const profile = await Customer.findById(customer.__id)
        
        if(profile) {
            profile.firstName = firstName
            profile.lastname = lastName
            profile.addresss = address

            const result = await profile.save()
            return res.status(200).json(result)
        }
    }

    return res.status(400).json({message: "error with profile update"})
}