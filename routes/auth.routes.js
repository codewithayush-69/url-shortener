import { Router } from "express";
import { getRegisterPage, getLoginPage, postLoginPage, postRegisterPage } from "../controller/auth.controller.js";

const router = Router();

router
.route("/register")
.get(getRegisterPage)
.post(postRegisterPage);

router
.route("/login")
.get(getLoginPage)
.post(postLoginPage);

router.get("/logout", (req, res) => {
  res.clearCookie("isLoggedIn");
  res.clearCookie("user");
  return res.redirect("/");
});

export const authRoutes = router; 