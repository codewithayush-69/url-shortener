import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { verifyJwtToken, checkRefreshToken } from "../service/auth.service.js";

// export const verfiAuthentication = (req, res, next) => {
//   const token = req.cookies.token;
//     if (!token) {
//         req.user = null;
//         return next();
//     }
//     try {
//         const decodedToken = verifyJwtToken(token);
//         req.user = decodedToken;
//        return next();
//     } catch (err) {
//         console.error("Token verification error:", err);
//         req.user = null;
//         return next();
//     }
// };

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

      const baseConfig = {
        httpOnly: true,
        secure: false,
      };

      res.cookie("access_token", newAccessToken, {
        ...baseConfig,
        maxAge: ACCESS_TOKEN_EXPIRY,
      });
      res.cookie("refresh_token", newRefreshToken, {
        ...baseConfig,
        maxAge: REFRESH_TOKEN_EXPIRY,
      });

      return next();

    } catch (error) {
      console.log(error);
      req.user = null;
    }
  }
  return next();
};
