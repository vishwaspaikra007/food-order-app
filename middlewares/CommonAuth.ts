import { NextFunction, Request, Response } from "express";
import { AuthPayLoad } from "../dto/Auto.dto";
import { ValidateSignature } from "../utility/PasswordUtlility";

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayLoad
        }
    }
}


export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const validate = await ValidateSignature(req)

    if(validate) {
        next()
    } else {
        return res.json({message: "User not authorized"})
    }
}