import { insertUser, getUserByEmail, hashingPassword, verifyPassword, genrateToken } from "../service/auth.service.js";

export const getRegisterPage = (req, res) => {
  return res.render("auth/register");
};

export const postRegisterPage = async (req, res) => {
  try { 
    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) return res.render("auth/register", { error: "Passwords do not match" });

    let verfiedEmail = await getUserByEmail(email);

    if (verfiedEmail) return res.render("auth/register", { error: "Email already registered" });

    const hashedPassword =  await hashingPassword(password);
    await insertUser({ username, email, hashedPassword});
    return res.redirect("/");

  } catch (error) {
    console.error("Registration error:", error);
    return res.render("auth/register", {
      error: "Something went wrong. Please try again.",
    });
  }
};

export const getLoginPage = (req, res) => {
  return res.render("auth/login");
};

export const postLoginPage = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await getUserByEmail(email);

    if (!user) {
      return res.render("auth/login", { error: "email doesn't exist" });
    }

    let verfication = await verifyPassword(user.passwordHash, password);

    console.log(verfication);

    if (!verfication) {
      return res.render("auth/login", { error: "Incorrect password" });
    }

    const token = genrateToken({ 
      id: user.id,
      username: user.username,
      email: user.email
     });
    res.cookie("token", token, )
    
    return res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
  }
};
