import express from 'express'
import { createVendor, GetTransactionById, GetTransactions, getVendorById, getVendors } from '../controllers'

const router = express.Router()

router.post('/vendor', createVendor)
router.get('/getVendors', getVendors)
router.get('/vendor/:id', getVendorById)

router.get('/transactions', GetTransactions)
router.get('/transaction/:id', GetTransactionById)


router.get('/', (req, res, next) => {
    res.json({message: "admin block"})
})

export { router as AdminRoute }