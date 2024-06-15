"use strict";
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
exports.EditCustomerProfile = exports.GetCustomerProfile = exports.RequestOtp = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignup = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const Customer_dto_1 = require("../dto/Customer.dto");
const PasswordUtlility_1 = require("../utility/PasswordUtlility");
const Customer_1 = require("../models/Customer");
const utility_1 = require("../utility");
const CustomerSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, { validationError: { target: true } });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password } = customerInputs;
    const salt = yield (0, PasswordUtlility_1.GenerateSalt)();
    const userpassword = yield (0, PasswordUtlility_1.GeneratePassword)(password, salt);
    const { otp, expiry } = (0, utility_1.GenerateOtp)();
    const existingUser = yield Customer_1.Customer.findOne({ email: email });
    if (existingUser !== null) {
        return res.status(409).send({ message: "user already exist" });
    }
    const result = yield Customer_1.Customer.create({
        email: email,
        password: userpassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        lat: 1,
        lng: 1,
        firstName: '',
        lastname: '',
        addresss: '',
        verified: false,
    });
    if (result) {
        // send OTP to customer
        try {
            yield (0, utility_1.onRequestOtp)(phone);
        }
        catch (err) {
            console.log(err);
            return res.status(400).send({ message: "error in signup" });
        }
        // generate the signature
        const signature = (0, PasswordUtlility_1.GenerateSignature)({
            __id: result.id,
            email: result.email,
            verified: result.verified
        });
        // send the result to client
        return res.status(200).json({
            signature: signature,
            verified: result.verified,
            email: result.email
        });
    }
    return res.status(400).send({ message: "error with singup" });
});
exports.CustomerSignup = CustomerSignup;
const CustomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.UserLoginInputs, req.body);
    const loginErrors = yield (0, class_validator_1.validate)(loginInputs, { validationError: { target: true } });
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }
    const { email, password } = loginInputs;
    const customer = yield Customer_1.Customer.findOne({ email: email });
    if (customer) {
        const validation = yield (0, PasswordUtlility_1.ValidatePassword)(password, customer.password, customer.salt);
        if (validation) {
            const signature = (0, PasswordUtlility_1.GenerateSignature)({
                __id: customer._id,
                email: customer.email,
                verified: customer.verified
            });
            return res.status(400).json({
                signature: signature,
                verified: customer.verified,
                email: customer.email
            });
        }
        else {
            // password didn't match 
        }
    }
    return res.status(400).json({ message: "error with login" });
});
exports.CustomerLogin = CustomerLogin;
const CustomerVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer.__id);
        if (profile) {
            const isVerified = yield (0, utility_1.verifyOtp)(profile.phone, otp);
            if (isVerified == true) {
                profile.verified = true;
                const updatedCustomerResponse = yield profile.save();
                const signature = (0, PasswordUtlility_1.GenerateSignature)({
                    __id: updatedCustomerResponse.id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified
                });
                return res.status(200).json({
                    signature: signature,
                    verified: updatedCustomerResponse.verified,
                    email: updatedCustomerResponse.email
                });
            }
        }
    }
    return res.status(400).json({ message: "error with OTP request" });
});
exports.CustomerVerify = CustomerVerify;
const RequestOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer.__id);
        if (profile) {
            try {
                yield (0, utility_1.onRequestOtp)(profile.phone);
            }
            catch (err) {
                console.log(err);
                return res.status(400).send({ message: "error in signup" });
            }
            res.status(200).json({ message: "Otp sent to your registered phone" });
        }
    }
});
exports.RequestOtp = RequestOtp;
const GetCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer.__id);
        if (profile) {
            return res.status(200).json(profile);
        }
    }
    return res.status(400).json({ message: "error with fetch profile" });
});
exports.GetCustomerProfile = GetCustomerProfile;
const EditCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const profileInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomProfileInputs, req.body);
    const loginErrors = yield (0, class_validator_1.validate)(profileInputs, { validationError: { target: true } });
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }
    const { firstName, lastName, address } = profileInputs;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer.__id);
        if (profile) {
            profile.firstName = firstName;
            profile.lastname = lastName;
            profile.addresss = address;
            const result = yield profile.save();
            return res.status(200).json(result);
        }
    }
    return res.status(400).json({ message: "error with profile update" });
});
exports.EditCustomerProfile = EditCustomerProfile;
//# sourceMappingURL=CustomerController.js.map