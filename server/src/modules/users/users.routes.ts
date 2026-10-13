import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import {
  getMe,
  getTeaching,
  listUsers,
  listStudents,
  createTeacherUser,
  createStudentUser,
  updateMyAvatar,
  updateUser,
  setUserStatus,
  setUserCourses,
  getStudentProgressByCourse,
} from "./users.controller";

const router = Router();

router.use(requireAuth);

router.get("/me", getMe);
router.patch("/me/avatar", updateMyAvatar);
router.get("/me/teaching", requireRole("teacher"), getTeaching);
router.get("/students", requireRole("teacher", "admin"), listStudents);
router.get("/", requireRole("admin"), listUsers);
// Nota: NO usar "/:id/progress/by-course" -- Express lo matchearia tambien
// contra "/me/progress/by-course" (id="me"), interceptando esa ruta antes de
// que progressRoutes la resuelva (usersRoutes esta montado primero en app.ts).
router.get("/:id/progress-by-course", requireRole("teacher", "admin"), getStudentProgressByCourse);
router.post("/teachers", requireRole("admin"), createTeacherUser);
router.post("/students", requireRole("admin"), createStudentUser);
router.patch("/:id", requireRole("admin"), updateUser);
router.patch("/:id/status", requireRole("admin"), setUserStatus);
router.put("/:id/courses", requireRole("admin"), setUserCourses);

export default router;
