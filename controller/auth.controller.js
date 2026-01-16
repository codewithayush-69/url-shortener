import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
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

export const getRegisterPage = (req, res) => {
  return res.render("auth/register");
};

export const postRegisterPage = async (req, res, next) => {
  if (req.user) {
    return res.redirect("/");
  }
  try {
    // const { username, email, password, confirm_password } = req.body;
    const { data, error } = registerUserSchema.safeParse(req.body);
    if (error) {
      const errorMessages = error.errors[0].message;
      req.flash("error", errorMessages);
      return res.redirect("/register");
    }

    const { username, email, password, confirm_password } = data;

    if (password !== confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    let existingUser = await getUserByEmail(email);

    if (existingUser) {
      req.flash("error", "Email already exists");
      return res.redirect("/register");
    }

    const hashedPassword = await hashingPassword(password);
    await insertUser({ username, email, hashedPassword });

    let user = await getUserByEmail(email);

    const session = createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = genrateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      sessionId: session.id,
    });

    const refreshToken = createRefreshToken(session.id);

    const baseConfig = {
      httpOnly: true,
      secure: false,
    };

    res.cookie("access_token", accessToken, {
      ...baseConfig,
      maxAge: ACCESS_TOKEN_EXPIRY,
    });
    res.cookie("refresh_token", refreshToken, {
      ...baseConfig,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    req.flash("success", "Account created successfully");
    return res.redirect("/");
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", "An error occurred during registration");
    return res.redirect("/register");
  }
};

export const getLoginPage = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  return res.render("auth/login");
};

export const postLoginPage = async (req, res) => {
  try {
    if (req.user) {
      return res.redirect("/");
    }

    const { data, error } = loginUserSchema.safeParse(req.body);

    if (error) {
      const errorMessages = error.errors[0].message;
      req.flash("error", errorMessages);
      return res.redirect("/login");
    }

    const { email, password } = data;

    let user = await getUserByEmail(email);

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const session = createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = genrateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      sessionId: session.id,
    });

    const refreshToken = createRefreshToken(session.id);

    const baseConfig = {
      httpOnly: true,
      secure: false,
    };

    res.cookie("access_token", accessToken, {
      ...baseConfig,
      maxAge: ACCESS_TOKEN_EXPIRY,
    });
    res.cookie("refresh_token", refreshToken, {
      ...baseConfig,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    return res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
  }
};

export const getProfilePage = async (req, res) => {
  console.log(req.user);

  if (!req.user) {
    return res.redirect("/login");
  }
  const users = await getUserById(req.user.id);

  if (!users) {
    req.flash("error", "User not found");
    return res.redirect("/login");
  }

  return res.render("auth/profile", { users });
};

export const logoutUser = (req, res) => {
  let option = { httpOnly: true, sameSite: "lax", secure: false, path: "/" };
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/login");
};

export const getEditProfilePage = (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  return res.render("auth/edit-profile");
};

export const postEditProfilePage = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);

    const validateEmail = await getUserByEmail(email);

    if (validateEmail && validateEmail.id !== req.user.id) {
      req.flash("error", "Email already in use");
      return res.redirect("/profile/edit");
    }
    await updateUser(req.user.id, { username, email, password });
    res.redirect("/profile");
  } catch (error) {
    console.error("Profile update error:", error);
  }
};
