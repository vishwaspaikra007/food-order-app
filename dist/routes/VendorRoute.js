"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const multer_1 = __importDefault(require("multer"));
const imageStore = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toString() + '_' + file.originalname);
    }
});
const images = (0, multer_1.default)({ storage: imageStore }).array('images', 10);
const router = express_1.default.Router();
exports.VendorRoute = router;
router.post('/login', controllers_1.VendorLogin);
router.use(middlewares_1.Authenticate); // everything below it will have [Authenticate] as middleware
// router.get('/profile', Authenticate ,GetVendorProfile)
router.get('/profile', controllers_1.GetVendorProfile);
router.patch('/profile', controllers_1.UpdateVendorProfile);
router.patch('/service', controllers_1.UpdateVendorService);
router.patch('/coverimage', images, controllers_1.UpdateVendorCoverImage);
router.post('/food', images, controllers_1.AddFood);
router.get('/food', controllers_1.GetFood);
router.get('/', (req, res, next) => {
    res.json({ message: "vendor block" });
});
//# sourceMappingURL=VendorRoute.js.map