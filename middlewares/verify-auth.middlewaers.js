import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../config/constants.js";
import { verifyJwtToken, checkRefreshToken } from "../service/auth.service.js";

/**
 * Middleware to verify JWT tokens from cookies
 * Handles both access token and refresh token verification
 * Sets req.user if authentication is successful
 */
export const verfiAuthentication = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  req.user = null;

  if (!accessToken && !refreshToken) {
    return next();
  }

  if (accessToken) {
    try {
      const decodedToken = verifyJwtToken(accessToken);
      req.user = decodedToken;
      return next();
    } catch (error) {
      console.error("Access token verification error:", error);
      req.user = null;
    }
  }

  if (refreshToken) {
    try {
      const { newAccessToken, newRefreshToken, user } =
        await checkRefreshToken(refreshToken);

      req.user = user;

      res.cookie("access_token", newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
      res.cookie(
        "refresh_token",
        newRefreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS
      );

      return next();
    } catch (error) {
      console.error("Refresh token verification error:", error);
      req.user = null;
    }
  }

  return next();
};
