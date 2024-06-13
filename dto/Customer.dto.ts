import {IsEmail, IsEmpty, Length} from 'class-validator'

export class CreateCustomInputs {
    
    @IsEmail()
    email: string

    @Length(7, 12)
    phone: string

    @Length(6, 12)
    password: string
}

export class EditCustomProfileInputs {

    @Length(3, 16)
    firstName: string

    @Length(3, 16)
    lastName: string

    @Length(3, 16)
    address: string

}

export class UserLoginInputs {
    
    @IsEmail()
    email: string

    @Length(6, 12)
    password: string
}

export interface CustomerPayload {
    __id: string
    email: string
    verified: boolean
}