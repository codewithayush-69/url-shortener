import { ACCESS_TOKEN_COOKIE_OPTIONS, REFRESH_TOKEN_COOKIE_OPTIONS } from "../config/constants.js";


export const flashErrorAndRedirect = (req, res, message, redirectPath) => {
  req.flash("error", message);
  return res.redirect(redirectPath);
};


export const flashSuccessAndRedirect = (req, res, message, redirectPath) => {
  req.flash("success", message);
  return res.redirect(redirectPath);
};

export const requireAuth = (req, res) => {
  if (!req.user) {
    res.redirect("/login");
    return false;
  }
  return true;
};

export const requireNotAuth = (req, res) => {
  if (req.user) {
    res.redirect("/");
    return false;
  }
  return true;
};


export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
  res.cookie("refresh_token", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
};

export const clearAuthCookies = (res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
};
