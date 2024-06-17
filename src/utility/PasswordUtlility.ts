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