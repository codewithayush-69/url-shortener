import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import flash from "connect-flash";
import path from "path";
import requestIp from "request-ip";
import session from "express-session";

import { authRoutes } from "./routes/auth.routes.js";
import { shortnerRouter } from "./routes/URL.routes.js";
import { verfiAuthentication } from "./middlewares/verify-auth.middlewaers.js";

const app = express();

// View engine configuration
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Middleware
app.use(express.static("style"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "flash-only-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'strict'
    }
  })
);

app.use(flash());
app.use(requestIp.mw());
app.use(verfiAuthentication);

// Local variables middleware
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use(authRoutes);
app.use(shortnerRouter);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
