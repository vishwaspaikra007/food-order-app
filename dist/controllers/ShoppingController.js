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
exports.RestaurantById = exports.SearchFoods = exports.GetFoodsIn30Min = exports.GetTopRestaurants = exports.GetFoodAvailability = void 0;
const models_1 = require("../models");
const GetFoodAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vendor.find({ pincode: pincode, serviceAvailable: true })
        .sort([['rating', 'descending']])
        .populate('foods');
    if (result.length > 0) {
        return res.status(200).json(result);
    }
    return res.status(400).json({ message: "Data not found" });
});
exports.GetFoodAvailability = GetFoodAvailability;
const GetTopRestaurants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vendor.find({ pincode: pincode, serviceAvailable: true })
        .sort([['rating', 'descending']])
        .limit(1);
    if (result.length > 0) {
        return res.status(200).json(result);
    }
    return res.status(400).json({ message: "Data not found" });
});
exports.GetTopRestaurants = GetTopRestaurants;
const GetFoodsIn30Min = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vendor.find({ pincode: pincode, serviceAvailable: true }).populate('foods');
    if (result.length > 0) {
        const foodsResult = [];
        result.map(vendor => {
            const foods = vendor.foods;
            foodsResult.push(...foods.filter(food => food.readyTime <= 30));
        });
        return res.status(200).json(foodsResult);
    }
    return res.status(400).json({ message: "Data not found" });
});
exports.GetFoodsIn30Min = GetFoodsIn30Min;
const SearchFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vendor.find({ pincode: pincode, serviceAvailable: true })
        .sort([['rating', 'descending']])
        .populate('foods');
    if (result.length > 0) {
        const foodsResult = [];
        result.map(vendor => foodsResult.push(...vendor.foods));
        return res.status(200).json(foodsResult);
    }
    return res.status(400).json({ message: "Data not found" });
});
exports.SearchFoods = SearchFoods;
const RestaurantById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield models_1.Vendor.findById(id)
        .sort([['rating', 'descending']])
        .populate('foods');
    if (result !== null) {
        return res.status(200).json(result);
    }
    return res.status(400).json({ message: "Data not found" });
});
exports.RestaurantById = RestaurantById;
//# sourceMappingURL=ShoppingController.js.map