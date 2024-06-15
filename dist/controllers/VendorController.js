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
exports.GetFood = exports.AddFood = exports.UpdateVendorCoverImage = exports.UpdateVendorService = exports.UpdateVendorProfile = exports.GetVendorProfile = exports.VendorLogin = void 0;
const AdminController_1 = require("./AdminController");
const PasswordUtlility_1 = require("../utility/PasswordUtlility");
const models_1 = require("../models");
const VendorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingVendor = yield (0, AdminController_1.findVendor)('', email);
    if (existingVendor != null) {
        // console.log(existingVendor)
        const validation = yield (0, PasswordUtlility_1.ValidatePassword)(password, existingVendor.password, existingVendor.salt);
        if (validation) {
            const signature = (0, PasswordUtlility_1.GenerateSignature)({
                __id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            });
            return res.json(signature);
        }
    }
    return res.json({ response: "login credentials incorrect" });
});
exports.VendorLogin = VendorLogin;
const GetVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminController_1.findVendor)(user.__id);
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor information not found" });
});
exports.GetVendorProfile = GetVendorProfile;
const UpdateVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, phone, foodTypes } = req.body;
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminController_1.findVendor)(user.__id);
        if (existingVendor !== null) {
            existingVendor.name = name;
            existingVendor.phone = phone;
            existingVendor.address = address;
            existingVendor.foodType = foodTypes;
            const savedResult = yield existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor information not found" });
});
exports.UpdateVendorProfile = UpdateVendorProfile;
const UpdateVendorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminController_1.findVendor)(user.__id);
        if (existingVendor !== null) {
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            const savedResult = yield existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor information not found" });
});
exports.UpdateVendorService = UpdateVendorService;
const UpdateVendorCoverImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const vendor = yield (0, AdminController_1.findVendor)(user.__id);
        if (vendor != null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            vendor.coverImages.push(...images);
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "Something went wrong with add food" });
});
exports.UpdateVendorCoverImage = UpdateVendorCoverImage;
const AddFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const { name, category, description, foodType, readyTime, price } = req.body;
        const vendor = yield (0, AdminController_1.findVendor)(user.__id);
        if (vendor != null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            const createdFood = yield models_1.Food.create({
                vendorId: vendor.id,
                name: name,
                category: category,
                description: description,
                foodType: foodType,
                readyTime: readyTime,
                images: images,
                price: price,
                rating: 0
            });
            vendor.foods.push(createdFood);
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "Something went wrong with add food" });
});
exports.AddFood = AddFood;
const GetFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const food = yield models_1.Food.find({ vendorId: user.__id });
        if (food !== null) {
            return res.json(food);
        }
    }
    return res.json({ message: "Food information not found" });
});
exports.GetFood = GetFood;
//# sourceMappingURL=VendorController.js.map