"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebaseAuth_1 = require("../middleware/firebaseAuth");
const productionClassController_1 = require("../controllers/productionClassController");
const router = (0, express_1.Router)();
router.use(firebaseAuth_1.requireAuthWithUser);
router.post('/', productionClassController_1.createClass);
router.get('/', productionClassController_1.getUserClasses);
router.get('/available', productionClassController_1.getAvailableClasses);
router.get('/join/:code', productionClassController_1.getClassByJoinCode);
router.post('/join', productionClassController_1.joinClassByCode);
router.post('/:id/regenerate-code', productionClassController_1.regenerateJoinCode);
router.get('/:id/submissions', productionClassController_1.getClassSubmissions);
router.get('/:id/students', productionClassController_1.getClassStudents);
router.delete('/:classId/students/:studentId', productionClassController_1.removeStudentFromClass);
exports.default = router;
//# sourceMappingURL=productionClassRoutes.js.map