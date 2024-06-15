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
exports.getVendorById = exports.findVendor = exports.getVendors = exports.createVendor = void 0;
const models_1 = require("../models");
const PasswordUtlility_1 = require("../utility/PasswordUtlility");
const createVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, pincode, foodType, email, password, ownerName, phone } = req.body;
    const existingUser = yield models_1.Vendor.findOne({ email: email });
    if (existingUser != null) {
        console.log("vendor already exist");
        return res.json({ response: `A user with this email ID ${email} already exist` });
    }
    // generate a salt
    // encrypt the password using salt
    const salt = yield (0, PasswordUtlility_1.GenerateSalt)();
    const pwd = yield (0, PasswordUtlility_1.GeneratePassword)(password, salt);
    const createdVendor = yield models_1.Vendor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: pwd,
        ownerName: ownerName,
        phone: phone,
        salt: salt,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        foods: []
    });
    console.log("vendor created successflly");
    return res.json(createdVendor);
});
exports.createVendor = createVendor;
const getVendors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendors = yield models_1.Vendor.find();
    if (vendors != null) {
        return res.json(vendors);
    }
    return res.json({ response: "Vendor data not available" });
});
exports.getVendors = getVendors;
const findVendor = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        return yield models_1.Vendor.findOne({ email: email });
    }
    else {
        return yield models_1.Vendor.findById(id);
    }
});
exports.findVendor = findVendor;
const getVendorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorID = req.params.id;
    const vendor = (0, exports.findVendor)(vendorID);
    if (vendor != null) {
        return res.json(vendor);
    }
    return res.json({ response: `no user with given ID: ${vendorID}` });
});
exports.getVendorById = getVendorById;
//# sourceMappingURL=AdminController.js.map