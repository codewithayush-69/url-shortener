import { Router } from "express";
import {
  postURLShortner,
  getURLShortner,
  redirectToShortLink,
  getShortnerEditPage,
  deleteShortLink,
  postShortnerEditPage,
} from "../controller/post.controller.js";

const router = Router();

router.get("/", getURLShortner);
router.post("/", postURLShortner);
router.get("/:shortCode", redirectToShortLink);

router
  .route("/edit/:id")
  .get(getShortnerEditPage)
  .post(postShortnerEditPage);

router.post("/delete/:id", deleteShortLink);

export const shortnerRouter = router;
