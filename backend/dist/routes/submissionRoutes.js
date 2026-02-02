"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebaseAuth_1 = require("../middleware/firebaseAuth");
const productionClassController_1 = require("../controllers/productionClassController");
const router = (0, express_1.Router)();
router.use(firebaseAuth_1.requireAuthWithUser);
router.get('/all', productionClassController_1.getAllTeacherSubmissions);
exports.default = router;
//# sourceMappingURL=submissionRoutes.js.map