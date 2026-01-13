export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    ADMIN_REGISTER: "/api/auth/admin-register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
  },

  // =====================================================
  // STUDENT ROUTES
  // =====================================================
  STUDENT: {
    PROFILE: "/api/std/profile",
    UPDATE: "/api/std/profile/update",
    UPDATE_IMAGE: "/api/std/profile/update-image",
    REMOVE_IMAGE: "/api/std/profile/remove-image",
    CHANGE_PASSWORD: "/api/std/profile/change-password",
    DELETE_ACCOUNT: "/api/std/profile/delete-account",

    DASHBOARD: "/api/std/dashboard",
    GRADES: "/api/std/grades",
    PROGRESS: "/api/std/progress",

    // ✅ SUBJECT PAGE (UNCHANGED)
    SUBJECTS: "/api/std/subjects",
    GET_SUBJECT: (id) => `/api/std/subjects/${id}`,
  },

  // =====================================================
  // ✅ STUDENT QUIZ ROUTES (MATCH BACKEND)
  // =====================================================
  STD_QUIZ: {
    // 🔥 SUBJECTS FOR QUIZ PAGE
    SUBJECTS: "/api/std/quiz/subjects",

    // 🔥 QUIZ LIST
    LIST: "/api/std/quiz",

    // 🔥 SINGLE QUIZ
    GET_ONE: (id) => `/api/std/quiz/${id}`,

    // 🔥 SAVE PROGRESS
    SAVE_PROGRESS: "/api/std/quiz/progress",

    // 🔥 SUBMIT QUIZ
    SUBMIT: "/api/std/quiz/submit",

    // 🔥 ATTEMPTS
    ATTEMPTS: "/api/std/quiz/attempts/list",

    // 🔥 LEADERBOARD
    LEADERBOARD: (quizId) =>
      `/api/std/quiz/${quizId}/leaderboard`,
  },

  // =====================================================
  // ADMIN ROUTES (NO CHANGE)
  // =====================================================
  ADMIN: {
    DASHBOARD: "/api/adm/dashboard",
    GET_SUBJECTS: "/api/adm/subjects",


    GRADES: "/api/adm/grades",
    ADD_GRADE: "/api/adm/grades/add",
    REMOVE_GRADE: "/api/adm/grades/remove",
    ADD_STUDENT: "/api/adm/grades/add-student",
    REMOVE_STUDENT: "/api/adm/grades/remove-student",

    SUBJECTS: "/api/adm/subjects",
    ADD_SUBJECT: "/api/adm/subjects/add",
    REMOVE_SUBJECT: "/api/adm/subjects/remove",
    ADD_UNIT: "/api/adm/subjects/add-unit",
    REMOVE_UNIT: "/api/adm/subjects/remove-unit",

    QUIZ: {
      BASE: "/api/adm/quiz",
      CREATE: "/api/adm/quiz",
      GET_ONE: (id) => `/api/adm/quiz/${id}`,
      UPDATE: (id) => `/api/adm/quiz/${id}`,
      DELETE: (id) => `/api/adm/quiz/${id}`,
      ADD_QUESTION: (id) => `/api/adm/quiz/${id}/questions`,
      UPDATE_QUESTION: (id, qId) =>
        `/api/adm/quiz/${id}/questions/${qId}`,
      DELETE_QUESTION: (id, qId) =>
        `/api/adm/quiz/${id}/questions/${qId}`,
    },

    PROFILE: "/api/adm/profile",
    UPDATE: "/api/adm/profile/update",
    UPDATE_IMAGE: "/api/adm/profile/update-image",
    REMOVE_IMAGE: "/api/adm/profile/remove-image",
    CHANGE_PASSWORD: "/api/adm/profile/change-password",
    DELETE_ACCOUNT: "/api/adm/profile/delete-account",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
