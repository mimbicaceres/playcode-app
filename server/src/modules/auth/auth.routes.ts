import { Router } from "express";
import { login } from "./auth.controller";

const router = Router();

// No hay registro publico: las cuentas las da de alta el administrador (POST /api/users/students y /teachers).
router.post("/login", login);

export default router;
