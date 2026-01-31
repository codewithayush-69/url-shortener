// import { readFile, writeFile } from "fs/promises";
// import path from "path";

// const DATA_FILE = path.join(process.cwd(), "data", "links.json");

// export const loadLink = async () => {
//   try {
//     console.log("Reading file from:", DATA_FILE);
//     const data = await readFile(DATA_FILE, "utf-8");
//     console.log("File contents:", data);
//     const parsed = JSON.parse(data);
//     console.log("Parsed data:", parsed);
//     return parsed;
//   } catch (error) {
//     console.error("Error in loadLink:", error);
//     if (error.code === "ENOENT") {
//       console.log("File not found, creating new one");
//       await writeFile(DATA_FILE, JSON.stringify({}));
//       return {};
//     }
//     throw error;
//   }
// };

// export const saveLink = async (link) => {
//   await writeFile(DATA_FILE, JSON.stringify(link));
// };

// import { dbClient } from "../config/db-client.js";
// import { env } from "../config/env.js";

// const db = dbClient.db(env.MONGODB_DATABASE_NAME);
// const shortnerLinks = db.collection('shortners')

import { db } from "../config/db-client.js";
import { shortLinks } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const loadLink = async (userId) => {
  const data = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.userId, userId));
  return data;
};

export const insertShortink = async ({ url, shortCode, userId }) => {
  return await db.insert(shortLinks).values({
    url,
    shortCode,
    userId,
  });
};

export const getLinkByShortCode = async (shortcode) => {
  const rows = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.shortCode, shortcode));

  return rows[0] || null;
};

export const deleteLinkById = async (id) => {
  const result = await db
    .delete(shortLinks)
    .where(eq(shortLinks.id, id));

  return result;
};

export const getLinkById = async (id) => {
  const rows = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.id, id));

  return rows[0] || null;
};

export const updateShortCode = async ({ id, url, shortCode }) => {
  return await db
    .update(shortLinks)
    .set({ url, shortCode })
    .where(eq(shortLinks.id, id));
};
