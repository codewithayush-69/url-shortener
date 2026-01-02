import { verifyJwtToken } from "../service/auth.service.js";

export const verfiAuthentication = (req, res, next) => {
  const token = req.cookies.token;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const decodedToken = verifyJwtToken(token);
        req.user = decodedToken;
       return next();
    } catch (err) {
        console.error("Token verification error:", err);
        req.user = null;
        return next();
    }
};