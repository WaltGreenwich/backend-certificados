"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenJWT = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "secreto";
const generateToken = (payload, expiresIn = "2h") => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
};
exports.generateToken = generateToken;
const verifyTokenJWT = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyTokenJWT = verifyTokenJWT;
