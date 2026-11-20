import jwt, { type JwtPayload } from "jsonwebtoken";
import type { UserRole } from "../../generated/prisma/client.js";

const issuer = "job-portal-api";
const audience = "job-portal-client";

export class InvalidRefreshTokenError extends Error {}
export class InvalidAccessTokenError extends Error {}

function getSecrets() {
  const access = process.env.JWT_ACCESS_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET;
  if (!access || access.length < 32 || !refresh || refresh.length < 32 || access === refresh) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values of at least 32 characters.");
  }
  return { access, refresh };
}

export function createTokenPair(user: { id: string; role: UserRole }) {
  const secrets = getSecrets();
  const sharedClaims = { role: user.role };
  const accessToken = jwt.sign({ ...sharedClaims, tokenType: "access" }, secrets.access, {
    subject: user.id,
    expiresIn: "15m",
    issuer,
    audience,
    algorithm: "HS256",
  });
  const refreshToken = jwt.sign({ ...sharedClaims, tokenType: "refresh" }, secrets.refresh, {
    subject: user.id,
    expiresIn: "7d",
    issuer,
    audience,
    algorithm: "HS256",
  });
  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): JwtPayload {
  const { refresh } = getSecrets();
  try {
    const decoded = jwt.verify(token, refresh, { issuer, audience, algorithms: ["HS256"] });
    if (typeof decoded === "string" || decoded.tokenType !== "refresh" || typeof decoded.sub !== "string") {
      throw new InvalidRefreshTokenError("Refresh token is invalid.");
    }
    return decoded;
  } catch {
    throw new InvalidRefreshTokenError("Refresh token is invalid or expired.");
  }
}

export function verifyAccessToken(token: string): JwtPayload {
  const { access } = getSecrets();
  try {
    const decoded = jwt.verify(token, access, { issuer, audience, algorithms: ["HS256"] });
    if (typeof decoded === "string" || decoded.tokenType !== "access" || typeof decoded.sub !== "string") {
      throw new InvalidAccessTokenError("Access token is invalid.");
    }
    return decoded;
  } catch {
    throw new InvalidAccessTokenError("Access token is invalid or expired.");
  }
}
