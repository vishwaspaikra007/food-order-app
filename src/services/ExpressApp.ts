import express, { Application } from "express";
import {AdminRoute, CustomerRoute, DeliveryRoute, ShoppingRoute, VendorRoute} from '../routes'
import path from 'path'


const App = async (app: Application) => {

    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.use('/images', express.static(path.join(__dirname, '../images')))


    app.use('/admin', AdminRoute);
    app.use('/vendor', VendorRoute);
    app.use(ShoppingRoute)
    app.use('/customer', CustomerRoute)
    app.use('/delivery', DeliveryRoute)

    return app
}

export default App