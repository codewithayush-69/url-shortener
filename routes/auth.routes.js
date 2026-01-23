import { Router } from "express";
import * as authController from "../controller/auth.controller.js";

const router = Router();

router
  .route("/register")
  .get(authController.getRegisterPage)
  .post(authController.postRegisterPage);

router
  .route("/login")
  .get(authController.getLoginPage)
  .post(authController.postLoginPage);

router
  .route("/profile/edit")
  .get(authController.getEditProfilePage)
  .post(authController.postEditProfilePage);

router
  .route("/profile/change-password")
  .get(authController.getPasswordChangePage)
  .post(authController.postPasswordChangePage)

router.route("/profile").get(authController.getProfilePage);
router.route("/logout").post(authController.logoutUser);

export const authRoutes = router; 