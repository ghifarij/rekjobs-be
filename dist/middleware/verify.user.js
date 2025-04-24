"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenUser = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyTokenUser = (req, res, next) => {
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
            // verify returns the payload object
            const verifiedUser = (0, jsonwebtoken_1.verify)(token, process.env.JWT_KEY);
            // attach to req.user
            req.user = verifiedUser;
            next();
        }
        catch (verifyError) {
            res.status(401).json({ message: "Invalid or expired token" });
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
exports.verifyTokenUser = verifyTokenUser;
//# sourceMappingURL=verify.user.js.map