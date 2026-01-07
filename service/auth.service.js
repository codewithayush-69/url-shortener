import { db } from "../config/db-client.js";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const insertUser = async ({ username, email, hashedPassword }) => {
  const data = await db.insert(users).values({
    username: username,
    email: email,
    passwordHash: hashedPassword,
  });
};

export const getUserByEmail = async (email) => {
  const rows = await db.select().from(users).where(eq(users.email, email));
  return rows[0];
};

export const getUserById = async (id) => {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0];
}

export const hashingPassword = async (password) => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
  if (
    !hashedPassword ||
    typeof hashedPassword !== "string" ||
    !hashedPassword.startsWith("$")
  ) {
    return false;
  }
  try {
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (error) {
    console.error("Password verification failed:", error.message);
    return false;
  }
};

export const genrateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyJwtToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const updateUser = async (userId, data) => {
  const updateData = {};

  if (data.username) {
    updateData.username = data.username;
  }

  if (data.email) {
    updateData.email = data.email;
  }

  if (data.password) {
    updateData.passwordHash = await hashingPassword(data.password);
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));

};
