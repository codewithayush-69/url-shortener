import crypto from "crypto";
import { shortLinkSchema } from "../Register-user-schema/shortner.validator.js";
import z from "zod";
import {
  loadLink,
  insertShortink,
  getLinkByShortCode,
  getLinkById,
  deleteLinkById,
  updateShortCode
} from "../service/shortnerdata.service.js";

export const getURLShortner = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  try {
    const links = await loadLink(req.user.id);
    return res.render("index", { links, host: req.host });
  } catch (error) {
    return res.status(500).send("Internal server error 3");
  }
};

export const postURLShortner = async (req, res) => {
  try {
    const { data, error } = shortLinkSchema.safeParse(req.body);
    if (error) {
      const errorMessages = error.errors[0].message;
      req.flash("error", errorMessages);
      return res.redirect("/");
    }

    const { url, shortCode } = data;

    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    const existing = await getLinkByShortCode(finalShortCode);

    if (existing) {
      const links = await loadLink(req.user.id);
      req.flash(
        "error",
        "Short code already in use. Please choose another one"
      );
      return res.render("index", { links, host: req.host });
    }

    await insertShortink({
      url,
      shortCode: finalShortCode,
      userId: req.user.id,
    });
    res.redirect("/");
  } catch (error) {
    console.error("URL shortening error:", error);
    const links = await loadLink(req.user.id);
    req.flash("error", "An error occurred while shortening the URL");
    return res.render("index", { links, host: req.host });
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const link = await getLinkByShortCode(shortCode);

    if (!link) {
      req.flash("error", "link not found");
      return res.redirect("/");
    }

    return res.redirect(link.url);
  } catch (err) {
    return res.status(500).send("Internal server error 1");
  }
};

export const getShortnerEditPage = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  try {
    const shortLink = await getLinkById(id);
    if (!shortLink) {
      req.flash("error", "Short link not found");
      return res.redirect("/");
    }

    res.render("shortlink-details", { 
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      host: req.host 
    }); 

  } catch (error) {
    console.error("Error fetching short link:", error);
    return res.status(500).send("Internal server error 2");
  }
};

export const postShortnerEditPage = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  const { data, error: validationError } = shortLinkSchema.safeParse(req.body);

  if (validationError) {
    const errorMessages = validationError.errors[0].message;
    req.flash("error", errorMessages);
    return res.redirect(`/edit/${id}`);
  }
  try {
    const shortLink = await getLinkById(id);
    if (!shortLink) {
      req.flash("error", "Short link not found");
      return res.redirect("/");
    }
    if (shortLink.userId !== req.user.id) {
      req.flash("error", "You cannot edit this link");
      return res.redirect("/");
    }
    const { url, shortCode } = data;

    const existing = await getLinkByShortCode(shortCode);
    if (existing && existing.id !== shortLink.id) {
      req.flash("error", "Short code already in use. Please choose another one");
      return res.redirect(`/edit/${id}`);
    }
    await updateShortCode({ id, url, shortCode });
    req.flash("success", "Link updated successfully");
    return res.redirect("/");
  } catch (error) {
    console.error("Error updating short link:", error);
    req.flash("error", "An error occurred while updating the link");
    return res.redirect(`/edit/${id}`);
  }
};

export const deleteShortLink = async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  if (error) {
    req.flash("error", "Invalid link ID");
    return res.redirect("/");
  }

  try {
    const shortLink = await getLinkById(id);
    if (!shortLink) {
      req.flash("error", "Short link not found");
      return res.redirect("/");
    }

    if (shortLink.userId !== req.user.id) {
      req.flash("error", "You cannot delete this link");
      return res.redirect("/");
    }

    await deleteLinkById(id);
    req.flash("success", "Link deleted successfully");
    return res.redirect("/");
  } catch (error) {
    console.error("Error deleting short link:", error);
    req.flash("error", "An error occurred while deleting the link");
    return res.redirect("/");
  }
};
