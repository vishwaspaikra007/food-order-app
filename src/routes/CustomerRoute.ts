import express from 'express'
import { CustomerLogin, CustomerSignup, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOtp } from '../controllers'
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

export {router as CustomerRoute}