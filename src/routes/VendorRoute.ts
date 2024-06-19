import express from 'express'
import { AddFood, GetCurrentOrders, GetFood, GetOrderDetails, GetVendorProfile, ProcessOrder, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from '../controllers'
import { Authenticate } from '../middlewares'
import multer from 'multer'


const imageStore = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toString() + '_' + file.originalname)
    }
})
    
const images = multer({storage: imageStore}).array('images', 10)

const router = express.Router()

router.post('/login', VendorLogin)

router.use(Authenticate) // everything below it will have [Authenticate] as middleware

// router.get('/profile', Authenticate ,GetVendorProfile)
router.get('/profile',GetVendorProfile)
router.patch('/profile', UpdateVendorProfile)
router.patch('/service', UpdateVendorService)
router.patch('/coverimage', images, UpdateVendorCoverImage)


router.post('/food', images, AddFood)
router.get('/food', GetFood)

// Orders

router.get('/orders', GetCurrentOrders)
router.put('/order/:id/process', ProcessOrder)
router.get('/order/:id', GetOrderDetails)


// Offers
router.get('/offers')
router.post('/offer')
router.put('/offer/:id')


router.get('/', (req, res, next) => {
    res.json({message: "vendor block"})
})

export { router as VendorRoute }