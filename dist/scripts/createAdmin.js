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
const prisma_1 = __importDefault(require("../src/config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash("admin123", 10);
        const admin = yield prisma_1.default.user.upsert({
            where: { dni: "99999999" },
            update: {},
            create: {
                fullName: "Administrador",
                dni: "99999999",
                password: hashedPassword,
                role: "admin",
            },
        });
        console.log("✅ Admin creado con éxito.");
        process.exit();
    }
    catch (err) {
        console.error("❌ Error al crear admin:", err);
        process.exit(1);
    }
});
createAdmin();
