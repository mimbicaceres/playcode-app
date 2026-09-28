// Ids of the courses of the CODIX catalog. Courses, units and activities are
// predefined by CODIX (their content lives in the frontend catalog); the backend
// only stores which courses an admin assigned to each student or teacher.
export const CODIX_COURSE_IDS = ["prog1", "py2", "java3", "js_base", "css_modern"] as const;

export function isCodixCourseId(id: unknown): id is string {
  return typeof id === "string" && (CODIX_COURSE_IDS as readonly string[]).includes(id);
}
