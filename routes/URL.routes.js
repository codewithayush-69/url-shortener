import {Router} from "express";
import { postURLShortner, getURLShortner, redirectToShortLink } from "../controller/post.controller.js";

const router = Router();

router.get("/", getURLShortner);

router.post("/", postURLShortner);

router.get("/:shortCode", redirectToShortLink);



export const shortnerRouter = router;
