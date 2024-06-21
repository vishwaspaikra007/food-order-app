import express from 'express'
import { DeliveryUserLogin, DeliveryUserSignup, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from '../controllers'
import { Authenticate } from '../middlewares'

const router = express.Router()

// Signup

router.post('/signup', DeliveryUserSignup)

// Login

router.post('/login', DeliveryUserLogin)

// ************** Authentication

router.use(Authenticate)

// Change service status

router.put('/change-status')

// Profile

router.get('/profile', GetDeliveryUserProfile)
router.patch('/profile', EditDeliveryUserProfile)

router.put('/change-status', UpdateDeliveryUserStatus)


export {router as DeliveryRoute}