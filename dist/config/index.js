"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
exports.config = {
    MONGODB_URI: `mongodb://localhost:27017/food-service`,
    APP_SECRET: `${process.env.APP_SECRET}`,
    TWILIO_ACCOUNT_SID: `${process.env.TWILIO_ACCOUNT_SID}`,
    TWILIO_AUTH_TOKEN: `${process.env.TWILIO_AUTH_TOKEN}`,
    TWILIO_SERVICE_SID: `${process.env.TWILIO_SERVICE_SID}`,
};
// export const MONGODB_URI = `mongodb+srv://vishwaspaikra007:${process.env.MONGODB_URI_PASSWORD}@cluster0.8ap2wpa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
//# sourceMappingURL=index.js.map