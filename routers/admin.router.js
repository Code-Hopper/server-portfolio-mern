import express from "express"

import DashboardAuth from "../Auth/DashboardAccessAuth.js"

import { verifyOTP, AdminLogin } from "../controllers/controller.js"
import { GetDashboardAccess } from "../controllers/dashboard.controller.js"

let AdminRouter = express()

AdminRouter.post('/verify-otp', verifyOTP);

AdminRouter.post('/login', AdminLogin);

AdminRouter.get("/dashboard", DashboardAuth, GetDashboardAccess)

export { AdminRouter }