import express from 'express'
import { AddToCart, CreateOrder, CustomerLogin, CustomerSignup, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrder, GetOrderById, RequestOtp } from '../controllers'
import { Authenticate } from '../middlewares'

const router = express.Router()

// Signup

router.post('/signup', CustomerSignup)

// Login

router.post('/login', CustomerLogin)

// ************** Authentication

router.use(Authenticate)

// Verify Customer Account

router.patch('/verify', CustomerVerify)

// OTP / Requesting OTP

router.get('/otp', RequestOtp)

// Profile

router.get('/profile', GetCustomerProfile)

router.patch('/profile', EditCustomerProfile)

// Cart 

router.post('/cart', AddToCart)
router.get('/cart', GetCart)
router.delete('/cart', DeleteCart)
// payment

// order

router.post('/create-order', CreateOrder)
router.get('/orders', GetOrder)
router.get('/order/:id', GetOrderById)

export {router as CustomerRoute}