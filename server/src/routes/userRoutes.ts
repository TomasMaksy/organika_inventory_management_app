import { Router } from "express";
import { getDashboardMetrics } from "../controllers/dashboardControllers";
import { getUsers } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);

export default router;