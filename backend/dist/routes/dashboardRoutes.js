"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const firebaseAuth_1 = require("../middleware/firebaseAuth");
const router = (0, express_1.Router)();
router.use(firebaseAuth_1.requireAuth);
router.get('/stats', dashboardController_1.getDashboardStats);
router.get('/assignment-status', dashboardController_1.getStudentAssignmentStatus);
router.get('/activity', dashboardController_1.getRecentActivity);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map