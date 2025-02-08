import express from "express"
import {verifyOTP, AdminLogin } from "../controllers/controller.js"

let AdminRouter = express()

AdminRouter.post('/verify-otp', verifyOTP);

AdminRouter.post('/login', AdminLogin);

export { AdminRouter }