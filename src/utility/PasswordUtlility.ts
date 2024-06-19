import bcrypt from 'bcrypt'
import { VendorPayload } from '../dto'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { Request } from 'express'
import { AuthPayLoad } from '../dto/Auto.dto'
import crypto from 'crypto'

export const GenerateSalt = async () => {
    return await bcrypt.genSalt()
}

export const GeneratePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt)
}

export const ValidatePassword = async (enteredPassword: string, savedPassword: string, salt: string) => {
    return await GeneratePassword(enteredPassword, salt) === savedPassword
}

export const GenerateSignature = (payload: AuthPayLoad) => {
    return jwt.sign(payload, config.APP_SECRET, {expiresIn: '2d'})
}

export const ValidateSignature = (req: Request) => {
    const signature = req.get('Authorization')

    if(signature) {

        const payload = jwt.verify(signature.split(' ')[1], config.APP_SECRET) as AuthPayLoad

        req.user = payload

        return true
    }
}

export const randomNum = (bit: number, enc: BufferEncoding) => {
    return crypto.randomBytes(bit).toString(enc)
}

export const getRandom8DigitNumber = () => {
    // Generate a random 4-byte buffer
    const buffer = crypto.randomBytes(4);
    
    // Convert buffer to a hex string and take the last 8 digits
    const randomHex = buffer.toString('hex').slice(0, 8);
    
    // Convert hex string to an integer
    const randomNumber = parseInt(randomHex, 16);

    // Ensure the number is exactly 8 digits long by taking modulo 100000000
    return randomNumber % 100000000;
}