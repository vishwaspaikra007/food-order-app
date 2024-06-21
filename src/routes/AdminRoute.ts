import express from 'express'
import { createVendor, GetDeliveryUsers, GetTransactionById, GetTransactions, getVendorById, getVendors, VerifyDeliveryUser } from '../controllers'

const router = express.Router()

router.post('/vendor', createVendor)
router.get('/getVendors', getVendors)
router.get('/vendor/:id', getVendorById)

router.get('/transactions', GetTransactions)
router.get('/transaction/:id', GetTransactionById)

router.put('/delivery/verify', VerifyDeliveryUser)
router.get('/delivery/users', GetDeliveryUsers)


router.get('/', (req, res, next) => {
    res.json({message: "admin block"})
})

export { router as AdminRoute }