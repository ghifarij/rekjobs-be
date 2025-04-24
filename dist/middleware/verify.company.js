"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenCompany = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyTokenCompany = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: "No authorization header found" });
            return;
        }
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;
        if (!token) {
            res.status(401).json({ message: "Invalid token format" });
            return;
        }
        try {
            const verifiedCompany = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
            req.company = verifiedCompany;
            next();
        }
        catch (verifyError) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
    }
    catch (err) {
        console.error("Token verification error:", err);
        res
            .status(500)
            .json({ message: "Internal server error during authentication" });
    }
};
exports.verifyTokenCompany = verifyTokenCompany;
//# sourceMappingURL=verify.company.js.map