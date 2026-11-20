import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema, registerSchema } from "./auth.validation.js";

test("registration accepts job seeker, employer, candidate, and recruiter roles and normalizes whitespace", () => {
  for (const role of ["job_seeker", "employer", "candidate", "recruiter"] as const) {
    const parsed = registerSchema.parse({
      email: " alex@example.com ",
      password: "secure-password",
      role,
    });
    assert.equal(parsed.email, "alex@example.com");
    assert.equal(parsed.role, role);
  }
});

test("registration rejects unsupported roles and short passwords", () => {
  assert.equal(registerSchema.safeParse({
    email: "alex@example.com",
    password: "12345",
    role: "admin",
  }).success, false);
});

test("login requires a valid email and non-empty password", () => {
  assert.equal(loginSchema.safeParse({ email: "alex@example.com", password: "secret" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "bad-email", password: "secret" }).success, false);
  assert.equal(loginSchema.safeParse({ email: "alex@example.com", password: "" }).success, false);
});
