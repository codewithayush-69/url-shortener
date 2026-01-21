import crypto from "crypto";
import z from "zod";
import { shortLinkSchema } from "../Register-user-schema/shortner.validator.js";
import {
  loadLink,
  insertShortink,
  getLinkByShortCode,
  getLinkById,
  deleteLinkById,
  updateShortCode,
} from "../service/shortnerdata.service.js";
import { validate, getFirstErrorMessage } from "../utils/validation.js";
import {
  requireAuth,
  flashErrorAndRedirect,
  flashSuccessAndRedirect,
} from "../utils/response.js";

export const getURLShortner = async (req, res) => {
  if (!requireAuth(req, res)) return ;

  try {
    const links = await loadLink(req.user.id);
    return res.render("index", { links, host: req.host });
  } catch (error) {
    console.error("Error fetching links:", error);
    return flashErrorAndRedirect(req, res, "An error occurred while fetching links", "/login");
  }
};

export const postURLShortner = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { data, error } = validate(shortLinkSchema, req.body);

    if (error) {
      return flashErrorAndRedirect(req, res, getFirstErrorMessage(error), "/");
    }

    const { url, shortCode } = data;
    const finalShortCode =
      shortCode || crypto.randomBytes(4).toString("hex");

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

    return flashSuccessAndRedirect(req, res, "Short link created successfully", "/");
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
      return flashErrorAndRedirect(req, res, "Short link not found", "/");
    }

    return res.redirect(link.url);
  } catch (error) {
    console.error("Error redirecting to short link:", error);
    return flashErrorAndRedirect(req, res, "An error occurred while accessing the short link", "/");
  }
};

export const getShortnerEditPage = async (req, res) => {
  if (!requireAuth(req, res)) return;

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  if (error) return flashErrorAndRedirect(req, res, "Invalid link ID", "/");

  try {
    const shortLink = await getLinkById(id);

    if (!shortLink) {
      return flashErrorAndRedirect(req, res, "Short link not found", "/");
    }

    if (shortLink.userId !== req.user.id) {
      return flashErrorAndRedirect(req, res, "You cannot edit this link", "/");
    }

    return res.render("shortLink-details", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      host: req.host,
    });
  } catch (error) {
    console.error("Error fetching short link:", error);
    return flashErrorAndRedirect(req, res, "An error occurred while fetching the link", "/");
  }
};

export const postShortnerEditPage = async (req, res) => {
  if (!requireAuth(req, res)) return;

  const { data: id, error: idError } = z.coerce.number().int().safeParse(req.params.id);
  if (idError) return flashErrorAndRedirect(req, res, "Invalid link ID", "/");

  const { data, error: validationError } = validate(shortLinkSchema, req.body);
  if (validationError) {
    return flashErrorAndRedirect(req, res, getFirstErrorMessage(validationError), `/edit/${id}`);
  }

  try {
    const shortLink = await getLinkById(id);

    if (!shortLink) {
      return flashErrorAndRedirect(req, res, "Short link not found", "/");
    }

    if (shortLink.userId !== req.user.id) {
      return flashErrorAndRedirect(req, res, "You cannot edit this link", "/");
    }

    const { url, shortCode } = data;
    const existing = await getLinkByShortCode(shortCode);

    if (existing && existing.id !== shortLink.id) {
      return flashErrorAndRedirect(
        req,
        res,
        "Short code already in use. Please choose another one",
        `/edit/${id}`
      );
    }

    await updateShortCode({ id, url, shortCode });
    return flashSuccessAndRedirect(req, res, "Link updated successfully", "/");
  } catch (error) {
    console.error("Error updating short link:", error);
    return flashErrorAndRedirect(req, res, "An error occurred while updating the link", `/edit/${id}`);
  }
};

export const deleteShortLink = async (req, res) => {
  if (!requireAuth(req, res)) return;

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return flashErrorAndRedirect(req, res, "Invalid link ID", "/");

  try {
    const shortLink = await getLinkById(id);

    if (!shortLink) {
      return flashErrorAndRedirect(req, res, "Short link not found", "/");
    }

    if (shortLink.userId !== req.user.id) {
      return flashErrorAndRedirect(req, res, "You cannot delete this link", "/");
    }

    await deleteLinkById(id);
    return flashSuccessAndRedirect(req, res, "Link deleted successfully", "/");
  } catch (error) {
    console.error("Error deleting short link:", error);
    return flashErrorAndRedirect(req, res, "An error occurred while deleting the link", "/");
  }
};
