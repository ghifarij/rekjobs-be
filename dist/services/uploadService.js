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
exports.uploadApplicationFile = uploadApplicationFile;
const cloudinary_1 = require("./cloudinary");
/**
 * Upload exactly one Multer file buffer to Cloudinary and return its secure URL.
 */
function uploadApplicationFile(file, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, cloudinary_1.cloudinaryUpload)(file, folder);
        return result.secure_url;
    });
}
//# sourceMappingURL=uploadService.js.map