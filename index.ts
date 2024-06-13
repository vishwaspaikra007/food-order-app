import express from "express";
import App from "./services/ExpressApp";
import dbConnection from "./services/Database";

const StartServer = async () => {
    
    const app = express()

    await dbConnection()

    await App(app)

    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => [
        console.log(`app is listening on port: ${PORT}`)
    ])
}


StartServer()