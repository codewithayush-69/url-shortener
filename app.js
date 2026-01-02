import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { shortnerRouter } from "./routes/URL.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { verfiAuthentication } from "./middlewares/verify-auth.middlewaers.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static("files"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(verfiAuthentication);

app.use(authRoutes);
app.use(shortnerRouter);

const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`server running at : http://localhost:${port}`);
});
