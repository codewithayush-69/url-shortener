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

//sql

import { db } from "../config/db-client.js";
import { shortLinks } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const loadLink = async () => {
  // return shortnerLinks.find().toArray();
  // const [rows] = await db.execute("select * from short_links");
  // return rows;
  const data = await db.select().from(shortLinks);
  return data;
};

export const insertShortink = async ({ url, shortCode }) => {
  // return shortnerLinks.insertOne(link);
  // const [result] = await db.execute(
  //   "insert into short_links(short_code, url) values(?,?)",
  //   [shortCode, url]
  // );
  // return result;

  const data = await db.insert(shortLinks).values({
    url: url,
    shortCode: shortCode,
  });
};

export const getLinkByShortCode = async (shortcode) => {
  // return await shortnerLinks.findOne({ shortCode: shortcode });
  // const [rows] = await db.execute(`select * from short_links where short_code = ?`,[shortcode]);

  const rows = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.shortCode, shortcode));

  // drizzle select() always returns an array
  return rows[0] || null;
};
