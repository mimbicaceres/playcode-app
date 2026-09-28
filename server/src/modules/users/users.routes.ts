import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import {
  getMe,
  getTeaching,
  listUsers,
  listStudents,
  createTeacherUser,
  updateUser,
  setUserStatus,
  setUserCourses,
} from "./users.controller";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);
router.get("/me/teaching", requireRole("teacher"), getTeaching);
router.get("/students", requireRole("teacher", "admin"), listStudents);
router.get("/", requireRole("admin"), listUsers);
router.post("/teachers", requireRole("admin"), createTeacherUser);
router.patch("/:id", requireRole("admin"), updateUser);
router.patch("/:id/status", requireRole("admin"), setUserStatus);
router.put("/:id/courses", requireRole("admin"), setUserCourses);

export default router;
