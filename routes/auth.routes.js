import { Router } from "express";
import { getRegisterPage, getLoginPage, postLoginPage, postRegisterPage, getProfilePage } from "../controller/auth.controller.js";

const router = Router();

router
.route("/register")
.get(getRegisterPage)
.post(postRegisterPage);

router
.route("/login")
.get(getLoginPage)
.post(postLoginPage);

router
.route("/profile")
.get(getProfilePage)

export const authRoutes = router; 