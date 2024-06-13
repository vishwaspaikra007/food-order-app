
// Email

import { config } from "../config"

// Notification

// OTP

export const GenerateOtp = () => {
    const otp = Math.floor(1e6 + Math.random() * 9e6)
    let expiry = new Date()
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000))

    return { otp, expiry }
}

export const onRequestOtp = async (to: string) => {
    const accountSid = config.TWILIO_ACCOUNT_SID
    const authToken = config.TWILIO_AUTH_TOKEN
    const client = require('twilio')(accountSid, authToken);

    return new Promise((resolve, reject) => {
        client.verify.v2.services(config.TWILIO_SERVICE_SID) //service sid
        .verifications
        .create({ to: '+91' + to, channel: 'sms' })
        .then((verification: any) => {
            console.log(verification.sid)
            resolve(verification.sid)
        }).catch((err: any) => {
            reject(err)
        })
    })
    
}

export const verifyOtp = async (to: string, otp: string) => {
    const accountSid = config.TWILIO_ACCOUNT_SID;
    const authToken = config.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    return new Promise((resolve, reject) => {
        client.verify.v2.services(config.TWILIO_SERVICE_SID)
            .verificationChecks
            .create({ to: '+91' + to, code: otp })
            .then((verification_check: any) => {
                console.log(verification_check.status)
                resolve(verification_check.status == "approved")
            }).catch((err: any) => {
                reject(err)
            });
    })
}

// payment notification or email