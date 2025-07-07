"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Token no proporcionado." });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Adjuntamos el payload decodificado al objeto req
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Token inválido o expirado." });
    }
};
exports.verifyToken = verifyToken;
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// const JWT_SECRET = process.env.JWT_SECRET || "secreto";
// export const verifyToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader)
//     return res.status(401).json({ message: "Token no enviado." });
//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     (req as any).user = decoded;
//     next();
//   } catch {
//     res.status(403).json({ message: "Token inválido." });
//   }
// };
