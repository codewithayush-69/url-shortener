import { db } from "../config/db-client.js";
import { users, sessionsTable, verifyEmailTokens } from "../drizzle/schema.js";
import { eq, sql, lt, and, gte } from "drizzle-orm";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import { get } from "http";

export const insertUser = async ({ username, email, hashedPassword }) => {
  return await db.insert(users).values({
    username,
    email,
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
};

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

export const createSession = async (userId, { ip, userAgent }) => {
  const session = await db
    .insert(sessionsTable)
    .values({
      userId,
      ip,
      userAgent,
    })
    .$returningId();
  return session[0];
};

export const genrateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

export const verifyJwtToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }
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

  if (data.newHashedPassword) {
    updateData.passwordHash = data.newHashedPassword;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));
};

const findSessionById = async (sessionId) => {
  const rows = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  return rows[0];
};

export const checkRefreshToken = async (token) => {
  const decoded = verifyJwtToken(token);
  const currentSession = await findSessionById(decoded.sessionId);

  if (!currentSession || !currentSession.valid) {
    throw new Error("Invalid session");
  }

  const user = await getUserById(currentSession.userId);
  if (!user) {
    throw new Error("User not found");
  }

  const userInfo = {
    id: user.id,
    username: user.username,
    email: user.email,
    isEmailValid: user.isEmailValid,
    sessionId: currentSession.id,
  };

  const newAccessToken = genrateAccessToken(userInfo);
  const newRefreshToken = createRefreshToken(currentSession.id);

  return {
    newAccessToken,
    newRefreshToken,
    user: userInfo,
  };
};

export const randomTokenGenerator = (digit = 6) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit - 1;
  return crypto.randomInt(min, max).toString();
};

export const insertVerifyEmailtoken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    try {
      await tx
        .delete(verifyEmailTokens)
        .where(lt(verifyEmailTokens.expiresAt, sql`CURRENT_TIMESTAMP`));

      await tx
        .delete(verifyEmailTokens)
        .where(eq(verifyEmailTokens.userId, userId));

      await tx.insert(verifyEmailTokens).values({
        userId,
        token,
      });
    } catch (error) {
      console.error("Error inserting verify email token:", error);
      throw error;
    }
  });
};

export const craeteEmailVerificationLink = ({ email, token }) => {
  // const encodedEmail = encodeURIComponent(email);
  // return `${process.env.BASE_URL}/verify-email?email=${encodedEmail}&token=${token}`;

  const url = new URL(`${process.env.BASE_URL}/verify_email-code`);

  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};

// export const findVerfiyEmailToken = async ({ token, email }) => {
//   const tokenData = await db
//     .select({
//       userId: verifyEmailTokens.userId,
//       token: verifyEmailTokens.token,
//       expiresAt: verifyEmailTokens.expiresAt,
//     })
//     .from(verifyEmailTokens)
//     .where(
//       and(
//         eq(verifyEmailTokens.token, token),
//         gte(verifyEmailTokens.expiresAt, sql`CURRENT_TIMESTAMP`),
//       ),
//     );

//   if (tokenData.length === 0) {
//     return null;
//   }

//   const userData = await getUserById(tokenData[0].userId);
//   if (!userData || userData.email !== email) {
//     return null;
//   }

//   return {
//     userId: tokenData[0].userId,
//     email: userData.email,
//     token: tokenData[0].token,
//     expiresAt: tokenData[0].expiresAt,
//   };
// };

export const findVerfiyEmailToken = async ({ token, email }) => {
  const data = await db
  .select({
    userId: users.id,
    email: users.email,
    token: verifyEmailTokens.token,
    expiresAt: verifyEmailTokens.expiresAt,
  })
  .from(verifyEmailTokens)
  .where(and(
  eq(verifyEmailTokens.token, token),
  gte(verifyEmailTokens.expiresAt, sql`CURRENT_TIMESTAMP`),
  eq(users.email, email)
))
  .innerJoin(users, eq(verifyEmailTokens.userId, users.id))

  if (data.length === 0) {
    return null;
  }
  return {
    userId: data[0].userId,
    email: data[0].email,
    token: data[0].token,
    expiresAt: data[0].expiresAt,
  };
};


export const verifyEmailAndUpdateStatus = async (email) => {
  await db
    .update(users)
    .set({ isEmailValid: true })
    .where(eq(users.email, email));
};

export const deleteVerifyEmailToken = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    return;
  }
  return await db
    .delete(verifyEmailTokens)
    .where(eq(verifyEmailTokens.userId, user.id));
};
