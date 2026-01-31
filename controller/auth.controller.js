import {
  loginUserSchema,
  registerUserSchema,
  changePasswordSchema,
} from "../Register-user-schema/auth.validator.js";
import {
  insertUser,
  getUserByEmail,
  getUserById,
  hashingPassword,
  verifyPassword,
  updateUser,
  createSession,
  createRefreshToken,
  genrateAccessToken,
  randomTokenGenerator,
  insertVerifyEmailtoken,
  craeteEmailVerificationLink,
} from "../service/auth.service.js";
import { validate, getFirstErrorMessage } from "../utils/validation.js";
import {
  setAuthCookies,
  clearAuthCookies,
  requireNotAuth,
  flashErrorAndRedirect,
  flashSuccessAndRedirect,
  requireAuth,
} from "../utils/response.js";
import { loadLink } from "../service/shortnerdata.service.js";
import { sendEmail } from "../utils/mailer.js";

export const getRegisterPage = (req, res) => {
  if (!requireNotAuth(req, res)) return;
  return res.render("auth/register");
};

export const postRegisterPage = async (req, res, next) => {
  if (!requireNotAuth(req, res)) return;

  try {
    const { data, error } = validate(registerUserSchema, req.body);
    if (error) {
      return flashErrorAndRedirect(
        req,
        res,
        getFirstErrorMessage(error),
        "/register",
      );
    }

    const { username, email, password, confirm_password } = data;

    if (password !== confirm_password) {
      return flashErrorAndRedirect(
        req,
        res,
        "Passwords do not match",
        "/register",
      );
    }

    let existingUser = await getUserByEmail(email);

    if (existingUser) {
      return flashErrorAndRedirect(
        req,
        res,
        "Email already exists",
        "/register",
      );
    }

    const hashedPassword = await hashingPassword(password);
    await insertUser({ username, email, hashedPassword });

    const user = await getUserByEmail(email);

    const session = await createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      isEmailValid: false,
      sessionId: session.id,
    };

    const accessToken = genrateAccessToken(userPayload);
    const refreshToken = createRefreshToken(session.id);

    setAuthCookies(res, accessToken, refreshToken);

    return flashSuccessAndRedirect(
      req,
      res,
      "Account created successfully",
      "/",
    );
  } catch (error) {
    console.error("Registration error:", error);
    return flashErrorAndRedirect(
      req,
      res,
      "An error occurred during registration",
      "/register",
    );
  }
};

export const getLoginPage = (req, res) => {
  if (!requireNotAuth(req, res)) return;
  return res.render("auth/login");
};

export const postLoginPage = async (req, res) => {
  try {
    if (!requireNotAuth(req, res)) return;

    const { data, error } = validate(loginUserSchema, req.body);

    if (error) {
      return flashErrorAndRedirect(
        req,
        res,
        getFirstErrorMessage(error),
        "/login",
      );
    }

    const { email, password } = data;

    let user = await getUserByEmail(email);

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return flashErrorAndRedirect(
        req,
        res,
        "Invalid email or password",
        "/login",
      );
    }

    const session = await createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: session.id,
    };

    const accessToken = genrateAccessToken(userPayload);
    const refreshToken = createRefreshToken(session.id);

    setAuthCookies(res, accessToken, refreshToken);

    return flashSuccessAndRedirect(req, res, "Login successful", "/");
  } catch (error) {
    console.error("Login error:", error);
    return flashErrorAndRedirect(
      req,
      res,
      "An error occurred during login",
      "/login",
    );
  }
};

export const getProfilePage = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return flashErrorAndRedirect(req, res, "User not found", "/login");
    }

    const links = await loadLink(user.id);
    const linksCreated = Array.isArray(links) ? links.length : 0;

    let lastActive = "Null";

    const joined = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : null;

    return res.render("auth/profile", {
      users: user,
      stats: { linksCreated, lastActive, joined },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return flashErrorAndRedirect(
      req,
      res,
      "An error occurred while fetching profile",
      "/",
    );
  }
};

export const logoutUser = (req, res) => {
  clearAuthCookies(res);
  return flashSuccessAndRedirect(req, res, "Logged out successfully", "/login");
};

export const getEditProfilePage = (req, res) => {
  if (!requireAuth(req, res)) return;

  return res.render("auth/edit-profile");
};

export const postEditProfilePage = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { username, email } = req.body;

    const existingUser = await getUserByEmail(email);

    if (existingUser && existingUser.id !== req.user.id) {
      return flashErrorAndRedirect(
        req,
        res,
        "Email already in use",
        "/profile/edit",
      );
    }

    await updateUser(req.user.id, { username, email });
    return flashSuccessAndRedirect(
      req,
      res,
      "Profile updated successfully",
      "/profile",
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return flashErrorAndRedirect(
      req,
      res,
      "An error occurred while updating profile",
      "/profile/edit",
    );
  }
};

export const getPasswordChangePage = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    res.render("auth/password-change");
  } catch (error) {
    console.error("Password update error:", error);
  }
};

export const postPasswordChangePage = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { data, error } = validate(changePasswordSchema, req.body);
    if (error) {
      return flashErrorAndRedirect(
        req,
        res,
        getFirstErrorMessage(error),
        "/profile/change-password",
      );
    }

    const { password, oldPassword, confirm_password } = data;

    if (password !== confirm_password) {
      return flashErrorAndRedirect(
        req,
        res,
        "Passwords do not match",
        "/profile/change-password",
      );
    }

    const user = await getUserById(req.user.id);
    const isOldPasswordValid = await verifyPassword(
      user.passwordHash,
      oldPassword,
    );

    if (!isOldPasswordValid) {
      return flashErrorAndRedirect(
        req,
        res,
        "Current password is incorrect",
        "/profile/change-password",
      );
    }

    const isSamePassword = await verifyPassword(user.passwordHash, password);
    if (isSamePassword) {
      return flashErrorAndRedirect(
        req,
        res,
        "New password must be different from current password",
        "/profile/change-password",
      );
    }

    const newHashedPassword = await hashingPassword(password);
    await updateUser(req.user.id, { newHashedPassword });

    return flashSuccessAndRedirect(
      req,
      res,
      "Password updated successfully",
      "/profile",
    );
  } catch (error) {
    console.error("Password update error:", error);
    return flashErrorAndRedirect(
      req,
      res,
      "An error occurred while updating password",
      "/profile/change-password",
    );
  }
};

export const getVerifyEmailPage = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const user = await getUserById(req.user.id);
    if (!user || user.isEmailValid) return res.redirect("/");

    res.render("auth/verify-email", { user });
  } catch (error) {
    console.error("Email verification error:", error);
  }
};

export const postResendVerification = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;
    const user = await getUserById(req.user.id);
    if (!user || user.isEmailValid) {
      return flashErrorAndRedirect(req, res, "Email is already verified", "/");
    }

    const randomToken = randomTokenGenerator();
    await insertVerifyEmailtoken({ userId: user.id, token: randomToken });
    const verificationLink = craeteEmailVerificationLink({
      email: user.email,
      token: randomToken,
    });

    sendEmail({
      to: user.email,
      subject: "Verify your email",
      html:`<h1>Please verify your email by clicking the link below:</h1>
            <p> You use this Token: <code>${randomToken}</code></p>
            <a href="${verificationLink}">Verify Email</a>`,
    }).catch(console.error);

    return flashSuccessAndRedirect(
      req,
      res,
      "Verification email resent successfully",
      "/verify_email",
    );
    
  } catch (error) {
    console.error("Resend verification error:", error);
    return flashErrorAndRedirect(
      req,
      res,
      "An error occurred while resending verification email",
      "/verify_email",
    );
  }
};
