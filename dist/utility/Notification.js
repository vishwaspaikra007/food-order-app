"use strict";
// Email
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.onRequestOtp = exports.GenerateOtp = void 0;
const config_1 = require("../config");
// Notification
// OTP
const GenerateOtp = () => {
    const otp = Math.floor(1e6 + Math.random() * 9e6);
    let expiry = new Date();
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));
    return { otp, expiry };
};
exports.GenerateOtp = GenerateOtp;
const onRequestOtp = (to) => __awaiter(void 0, void 0, void 0, function* () {
    const accountSid = config_1.config.TWILIO_ACCOUNT_SID;
    const authToken = config_1.config.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    return new Promise((resolve, reject) => {
        client.verify.v2.services(config_1.config.TWILIO_SERVICE_SID) //service sid
            .verifications
            .create({ to: '+91' + to, channel: 'sms' })
            .then((verification) => {
            console.log(verification.sid);
            resolve(verification.sid);
        }).catch((err) => {
            reject(err);
        });
    });
});
exports.onRequestOtp = onRequestOtp;
const verifyOtp = (to, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const accountSid = config_1.config.TWILIO_ACCOUNT_SID;
    const authToken = config_1.config.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    return new Promise((resolve, reject) => {
        client.verify.v2.services(config_1.config.TWILIO_SERVICE_SID)
            .verificationChecks
            .create({ to: '+91' + to, code: otp })
            .then((verification_check) => {
            console.log(verification_check.status);
            resolve(verification_check.status == "approved");
        }).catch((err) => {
            reject(err);
        });
    });
});
exports.verifyOtp = verifyOtp;
// payment notification or email
//# sourceMappingURL=Notification.js.map