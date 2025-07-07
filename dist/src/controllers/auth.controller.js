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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
// Change return type from Promise<Response> to Promise<void>
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // <--- Changed here
    const { dni, password } = req.body;
    const user = yield prisma_1.default.user.findUnique({ where: { dni } });
    if (!user) {
        res.status(401).json({ message: "Usuario no encontrado" });
        return; // <--- Add return to exit function after sending response
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: "Contraseña incorrecta" });
        return; // <--- Add return to exit function after sending response
    }
    const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role });
    res.status(200).json({
        // <--- No need for 'return' here
        token,
        user: {
            id: user.id,
            fullName: user.fullName,
            dni: user.dni,
            role: user.role,
        },
    });
    // No explicit 'return' needed at the end, as the function implicitly finishes after sending response
});
exports.login = login;
