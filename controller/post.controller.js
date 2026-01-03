import crypto from "crypto";
import {
  loadLink,
  insertShortink,
  getLinkByShortCode,
} from "../service/shortnerdata.service.js";

export const getURLShortner = async (req, res) => {
  try {
    const links = await loadLink();
    return res.render("index", { links, host: req.host});
  } catch (error) {
    return res.status(500).send("Internal server error 3");
  }
};

export const postURLShortner = async (req, res) => {
  try {
    const { url, shortCode } = req.body;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    const existing = await getLinkByShortCode(finalShortCode);
    
    if (existing) {
      const links = await loadLink();
      return res.render("index", { links, host: req.host, error: "Short code already exists, choose another" });
    }

    await insertShortink({ url, shortCode: finalShortCode });
    res.redirect("/");
  } catch (error) {
    console.error("URL shortening error:", error);
    const links = await loadLink();
    return res.render("index", { links, host: req.host, error: "Something went wrong. Please try again." });
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await getLinkByShortCode(shortCode);

    if (!link) {
      return res.status(404).send("Sorry, this short URL was not found.");
    }

    return res.redirect(link.url);
  } catch (err) {
    return res.status(500).send("Internal server error 1");
  }
};
