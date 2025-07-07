"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares globales
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Exponer archivos (PDFs y QR) de forma controlada
app.use("/uploads", express_1.default.static("src/uploads"));
// Rutas base
app.use("/api/admin", admin_routes_1.default);
app.use("/api/student", student_routes_1.default);
app.use("/api", public_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
// Ruta por defecto
app.get("/", (req, res) => {
    res.send("API Certificados en funcionamiento ✅");
});
exports.default = app;
