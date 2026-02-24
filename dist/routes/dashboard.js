"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const DashboardController_1 = require("../controllers/DashboardController");
const router = (0, express_1.Router)();
router.get('/', auth_1.autenticar, DashboardController_1.obterDashboard);
exports.default = router;
