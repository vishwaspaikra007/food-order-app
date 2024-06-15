import express from "express";
import App from "./services/ExpressApp";
import dbConnection from "./services/Database";
import { config } from "./config";

const StartServer = async () => {
    
    const app = express()

    await dbConnection()

    await App(app)

    const PORT = config.PORT || 3000

    app.listen(PORT, () => [
        console.log(`app is listening on port: ${PORT}`)
    ])
}


StartServer()