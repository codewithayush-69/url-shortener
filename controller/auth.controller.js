import {
  insertUser,
  getUserByEmail,
  getUserById,
  hashingPassword,
  verifyPassword,
  genrateToken,
  updateUser,
} from "../service/auth.service.js";

export const getRegisterPage = (req, res) => {
  return res.render("auth/register");
};

export const postRegisterPage = async (req, res, next) => {
  try {
    if (req.user) {
      return res.redirect("/");
    }

    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    let verfiedEmail = await getUserByEmail(email);

    if (verfiedEmail) {
      req.flash("error", "Email already exists");
      return res.redirect("/register");
    }

    const hashedPassword = await hashingPassword(password);

    await insertUser({ username, email, hashedPassword });

    let user = await getUserByEmail(email);
    const token = genrateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    res.cookie("token", token);
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
    const { email, password } = req.body;

    let user = await getUserByEmail(email);

    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    let verfication = await verifyPassword(user.passwordHash, password);

    if (!verfication) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const token = genrateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    res.cookie("token", token);

    return res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
  }
};

export const getProfilePage = async(req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const users = await getUserById(req.user.id);
  return res.render("auth/profile", {users: users});
};

export const logoutUser = (req, res) => {
  res.clearCookie("token");
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
