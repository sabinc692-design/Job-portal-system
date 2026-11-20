import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";
import { createTokenPair, InvalidRefreshTokenError, verifyRefreshToken } from "./token.service.js";

const originalAccess = process.env.JWT_ACCESS_SECRET;
const originalRefresh = process.env.JWT_REFRESH_SECRET;
process.env.JWT_ACCESS_SECRET = "test-access-secret-that-is-long-enough-123";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-different-456";

test("creates short-lived access and refresh tokens with distinct token types", () => {
  const pair = createTokenPair({ id: "user_123", role: "JOB_SEEKER" });
  const access = jwt.decode(pair.accessToken) as jwt.JwtPayload;
  const refresh = verifyRefreshToken(pair.refreshToken);

  assert.equal(access.sub, "user_123");
  assert.equal(access.tokenType, "access");
  assert.equal(refresh.sub, "user_123");
  assert.equal(refresh.tokenType, "refresh");
  assert.ok((access.exp ?? 0) - (access.iat ?? 0) <= 15 * 60);
});

test("does not accept an access token as a refresh token", () => {
  const pair = createTokenPair({ id: "user_123", role: "EMPLOYER" });
  assert.throws(() => verifyRefreshToken(pair.accessToken), InvalidRefreshTokenError);
});

test.after(() => {
  if (originalAccess === undefined) delete process.env.JWT_ACCESS_SECRET;
  else process.env.JWT_ACCESS_SECRET = originalAccess;
  if (originalRefresh === undefined) delete process.env.JWT_REFRESH_SECRET;
  else process.env.JWT_REFRESH_SECRET = originalRefresh;
});
