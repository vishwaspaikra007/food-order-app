
import mongoose from "mongoose";
import { config } from "../config";

const dbConnection = async () => {

    try {

    } catch(err) {
        console.log(err)
    }

    await mongoose.connect(config.MONGODB_URI, {

    }).then(result => {
        console.log("DB connected")
    }).catch(err => {
        console.clear()
        console.log(`error ${err}`)
    })
}

export default dbConnection