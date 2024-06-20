import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { CartItems, CreateCustomInputs, EditCustomProfileInputs, OrderInputs, UserLoginInputs } from "../dto/Customer.dto";
import { GeneratePassword, GenerateSalt, GenerateSignature, getRandom8DigitNumber, randomNum, ValidatePassword } from "../utility/PasswordUtlility";
import { Customer, CustomerDoc } from "../models/Customer";
import { GenerateOtp, onRequestOtp, verifyOtp } from "../utility";
import { Food, Offer, Order, Transaction, TransactionDoc } from "../models";

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
        orders: []
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

    const loginErrors = await validate(loginInputs, { validationError: { target: true } })
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors)
    }

    const { email, password } = loginInputs

    const customer = await Customer.findOne({ email: email })

    if (customer) {
        const validation = await ValidatePassword(password, customer.password, customer.salt)

        if (validation) {
            const signature = GenerateSignature({
                __id: customer._id as string,
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

    return res.status(400).json({ message: "error with login" })

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

    return res.status(400).json({ message: "error with OTP request" })
}

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if (customer) {
        const profile = await Customer.findById(customer.__id)

        if (profile) {
            try {
                await onRequestOtp(profile.phone)
            } catch (err) {
                console.log(err)
                return res.status(400).send({ message: "error in signup" })
            }

            res.status(200).json({ message: "Otp sent to your registered phone" })
        }
    }
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    if (customer) {
        const profile = await Customer.findById(customer.__id)

        if (profile) {

            return res.status(200).json(profile)
        }
    }

    return res.status(400).json({ message: "error with fetch profile" })
}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user

    const profileInputs = plainToClass(EditCustomProfileInputs, req.body)

    const loginErrors = await validate(profileInputs, { validationError: { target: true } })

    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors)
    }

    const { firstName, lastName, address } = profileInputs

    if (customer) {
        const profile = await Customer.findById(customer.__id)

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


const validateTransaction = async (txnId: string) => {
    const currentTransaction = await Transaction.findById(txnId)

    if(currentTransaction) {
        if(currentTransaction.status.toLocaleLowerCase() !== 'failed') {
            return {status: true, currentTransaction}
        }
    }

    return {status: false, currentTransaction}
}

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

    // grab current login customer

    const customer = req.user

    const {txnId, amount, items} = <OrderInputs>req.body

    if (customer) {
        // Validate transaction

        const { status, currentTransaction} = await validateTransaction(txnId)

        if(!status) {
            return res.status(404).json({message: "error with create order"})
        }
        // create an order ID

        // const orderId = randomNum(8, 'hex')
        const orderId = `${getRandom8DigitNumber()}`

        const profile = await Customer.findById(customer.__id)

        if (profile) {
            // grab order item from request [ {id: XX, unit: XX}]

            let cartitems = Array()
            let netAmount = 0.0

            // Calculate Order amount
            const foods = await Food.find().where('_id').in(items.map(item => item._id)).exec()
            let vendorId

            foods.map(food => {
                items.map(({ _id, unit }) => {
                    if (food._id == _id) {
                        vendorId = food.vendorId
                        netAmount += (food.price * unit)
                        cartitems.push({ food, unit })
                    }
                })
            })

            // Calculate Order with Item Description
            if (cartitems) {
                // create order

                const currentOrder = await Order.create({
                    orderId: orderId,
                    vendorId: vendorId,
                    items: cartitems,
                    totalAmount: netAmount,
                    paidAmount: amount,
                    orderDate: new Date(),
                    orderStatus: 'waiting',
                    remarks: '',
                    deliveryId: '',
                    readyTime: 45,
                })

                if (currentOrder) {
                    profile.cart = [] as any;
                    profile.Orders.push(currentOrder)

                    if(currentTransaction) {
                        if(vendorId) currentTransaction.vendorId = vendorId
                        currentTransaction.orderID = orderId
                        currentTransaction.status = "CONFIRMED"
    
                        await currentTransaction?.save()
                    }

                    await profile.save()

                    return res.status(200).json(currentOrder)
                }
            }
        }


        // finally update order to user account

    }

    return res.status(400).json({ message: "Error with create order" })
}

export const GetOrder = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if (customer) {
        const profile = await Customer.findById(customer.__id).populate('Orders')

        if (profile) {
            return res.status(200).send(profile.Orders)
        }
    }
    return res.status(400).json({ message: "Error with get order" })
}

export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.id

    if (orderId) {
        const order = await Order.findById(orderId).populate('items.food')

        if (order) {
            return res.status(200).send(order)
        }
    }
    return res.status(400).json({ message: "Error with get order" })
}

// ------------------------------------------------- Cart Selection

export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if (customer) {

        const profile = await Customer.findById(customer.__id).populate('cart.food')
        let cartitems = Array()

        const { _id, unit } = <CartItems>req.body

        const food = await Food.findById(_id)

        if (food) {
            if (profile) {
                cartitems = profile.cart

                if (cartitems.length > 0) {
                    let existFoodItem = cartitems.filter((item) => item.food._id == _id)

                    if (existFoodItem.length > 0) {
                        const index = cartitems.indexOf(existFoodItem[0])

                        if (unit > 0) {
                            cartitems[index] = { food, unit }
                        } else {
                            cartitems.splice(index, 1)
                        }
                    } else {
                        cartitems.push({ food, unit })
                    }
                } else {
                    cartitems.push({ food, unit })
                }

                if (cartitems) {
                    profile.cart = cartitems as any
                    const cartResult = await profile.save()
                    return res.status(200).json(cartResult.cart)
                }
            }
            return res.status(400).json({ message: "unable to find profile to add to Cart" })
        }
        return res.status(400).json({ message: "unable to find food to add to Cart" })

    }

    return res.status(400).json({ message: "unable to find customer to add to Cart" })
}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if (customer) {
        const profile = await Customer.findById(customer.__id).populate('cart.food')

        if (profile) {
            return res.status(200).json(profile.cart)
        }
    }

    return res.status(400).json({ message: "cart is empty" })
}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if (customer) {
        const profile = await Customer.findById(customer.__id).populate('cart.food')

        if (profile) {
            profile.cart = [] as any
            const cartResult = await profile.save()
            return res.status(200).json(cartResult)
        }
    }

    return res.status(400).json({ message: "cart is empty" })
}

export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

    const offerId = req.params.id
    const customer = req.user

    if(customer) {
        const appliedOffer = await Offer.findById(offerId)

        if(appliedOffer) {

            if(appliedOffer.promoType === "USER") {

            }
            else {
                if(appliedOffer.isActive) {
                    return res.status(200).json({message: "Offer is valid", offer: appliedOffer})
                }
            }
        }

    }

    return res.status(400).json({message: "offer is not valid"})
}

export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {
    const customer = req.user

    if(customer) {
        const { amount, offerId, paymentMode } = req.body

        let payableAmount = Number(amount)

        if(offerId) {

            const appliedOffer = await Offer.findById(offerId)

            if(appliedOffer) {
                if(appliedOffer.isActive) {
                    payableAmount = (payableAmount - appliedOffer.offerAmount)
                }
            }
        }

        // perform payment gateway charge api call

        // create record on transition

        const transaction = await Transaction.create({
            customer: customer.__id,
            vendorId: '',
            orderID: '',
            orderValue: payableAmount,
            offerUsed: offerId || "NA",
            status: 'OPEN',
            paymentMode: paymentMode,
            paymentResponse: 'Payment is CASH ON DELIVERY',
        })
        // return transaction ID

        return res.status(200).json(transaction)
    }
}