import {
  loginUserSchema,
  registerUserSchema,
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

export const getRegisterPage = (req, res) => {
  if (!requireNotAuth(req, res)) return;
  return res.render("auth/register");
};

export const postRegisterPage = async (req, res, next) => {
  if (!requireNotAuth(req, res)) return;

  try {
    const { data, error } = validate(registerUserSchema, req.body);
    if (error) {
      return flashErrorAndRedirect(req, res, getFirstErrorMessage(error), "/register");
    }

    const { username, email, password, confirm_password } = data;

    if (password !== confirm_password) {
      return flashErrorAndRedirect(req, res, "Passwords do not match", "/register");
    }

    let existingUser = await getUserByEmail(email);

    if (existingUser) {
      return flashErrorAndRedirect(req, res, "Email already exists", "/register");
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
      sessionId: session.id,
    };

    const accessToken = genrateAccessToken(userPayload);
    const refreshToken = createRefreshToken(session.id);

    setAuthCookies(res, accessToken, refreshToken);

    return flashSuccessAndRedirect(req, res, "Account created successfully", "/");
  } catch (error) {
    console.error("Registration error:", error);
    return flashErrorAndRedirect(req, res, "An error occurred during registration", "/register");
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
      return flashErrorAndRedirect(req, res, getFirstErrorMessage(error), "/login");
    }

    const { email, password } = data;

    let user = await getUserByEmail(email);

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      return flashErrorAndRedirect(req, res, "Invalid email or password", "/login");
    }

    const session = await createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      sessionId: session.id,
    };

    const accessToken = genrateAccessToken(userPayload);
    const refreshToken = createRefreshToken(session.id);

    setAuthCookies(res, accessToken, refreshToken);

    return flashSuccessAndRedirect(req, res, "Login successful", "/");
  } catch (error) {
    console.error("Login error:", error);
  }
};

export const getProfilePage = async (req, res) => {
  if (!requireAuth(req, res)) return ;

  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return flashErrorAndRedirect(req, res, "User not found", "/login");
    }

    return res.render("auth/profile", { users: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return flashErrorAndRedirect(req, res, "An error occurred while fetching profile", "/");
  }
};

export const logoutUser = (req, res) => {
  clearAuthCookies(res);
  return flashSuccessAndRedirect(req, res, "Logged out successfully", "/login");
};

export const getEditProfilePage = (req, res) => {
    if (!requireAuth(req, res)) return ;

  return res.render("auth/edit-profile");
};

export const postEditProfilePage = async (req, res) => {
    if (!requireAuth(req, res)) return ;

  try {
    const { username, email, password } = req.body;

    const existingUser = await getUserByEmail(email);

    if (existingUser && existingUser.id !== req.user.id) {
      return flashErrorAndRedirect(req, res, "Email already in use", "/profile/edit");
    }

    await updateUser(req.user.id, { username, email, password });
    return flashSuccessAndRedirect(req, res, "Profile updated successfully", "/profile");
  } catch (error) {
    console.error("Profile update error:", error);
    return flashErrorAndRedirect(req, res, "An error occurred while updating profile", "/profile/edit");
  }
};
