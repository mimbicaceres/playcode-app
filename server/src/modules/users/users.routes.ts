import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { getMe, listUsers, listStudents } from "./users.controller";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);
router.get("/students", requireRole("teacher", "admin"), listStudents);
router.get("/", requireRole("admin"), listUsers);

export default router;
