import "dotenv/config";
import assert from "node:assert/strict";
import test from "node:test";
import http from "node:http";
import { app } from "./app.js";
import { createTokenPair } from "./modules/auth/token.service.js";

let server: http.Server;
let baseUrl: string;

test.before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (typeof address === "object" && address !== null) {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("POST /api/auth/register rejects admin role and validation errors", async () => {
  // Reject admin self-registration
  const adminRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "newadmin@example.com",
      password: "secure-password-123",
      role: "admin",
    }),
  });
  assert.equal(adminRes.status, 400);

  // Reject short password
  const shortPassRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "user@example.com",
      password: "123",
      role: "candidate",
    }),
  });
  assert.equal(shortPassRes.status, 400);
});

test("POST /api/auth/logout succeeds", async () => {
  const res = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
});

test("Recruiter routes enforce authentication and role", async () => {
  // Unauthenticated
  const unauthRes = await fetch(`${baseUrl}/api/recruiter/job`);
  assert.equal(unauthRes.status, 401);

  // Wrong role (candidate)
  const candidateToken = createTokenPair({ id: "cand_1", role: "JOB_SEEKER" }).accessToken;
  const wrongRoleRes = await fetch(`${baseUrl}/api/recruiter/job`, {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  assert.equal(wrongRoleRes.status, 403);

  // Correct role (recruiter / employer)
  const recruiterToken = createTokenPair({ id: "rec_1", role: "EMPLOYER" }).accessToken;
  const okRes = await fetch(`${baseUrl}/api/recruiter/job`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  assert.equal(okRes.status, 200);
  const json = await okRes.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
});

test("Recruiter routes return 404 for missing jobs", async () => {
  const recruiterToken = createTokenPair({ id: "rec_1", role: "EMPLOYER" }).accessToken;
  const headers = { Authorization: `Bearer ${recruiterToken}`, "Content-Type": "application/json" };

  const getRes = await fetch(`${baseUrl}/api/recruiter/job/missing-id-123`, { headers });
  assert.equal(getRes.status, 404);

  const patchRes = await fetch(`${baseUrl}/api/recruiter/job/missing-id-123`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title: "Updated" }),
  });
  assert.equal(patchRes.status, 404);

  const delRes = await fetch(`${baseUrl}/api/recruiter/job/missing-id-123`, {
    method: "DELETE",
    headers,
  });
  assert.equal(delRes.status, 404);
});

test("Candidate routes enforce authentication and role", async () => {
  // Unauthenticated
  const unauthRes = await fetch(`${baseUrl}/api/candidate/jobs`);
  assert.equal(unauthRes.status, 401);

  // Wrong role (recruiter)
  const recruiterToken = createTokenPair({ id: "rec_1", role: "EMPLOYER" }).accessToken;
  const wrongRoleRes = await fetch(`${baseUrl}/api/candidate/jobs`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  assert.equal(wrongRoleRes.status, 403);

  // Correct role (candidate)
  const candidateToken = createTokenPair({ id: "cand_1", role: "JOB_SEEKER" }).accessToken;
  const okRes = await fetch(`${baseUrl}/api/candidate/jobs`, {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  assert.equal(okRes.status, 200);
  const json = await okRes.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data.jobs));
});

test("Candidate routes handle non-existent jobs properly", async () => {
  const candidateToken = createTokenPair({ id: "cand_1", role: "JOB_SEEKER" }).accessToken;
  const headers = { Authorization: `Bearer ${candidateToken}`, "Content-Type": "application/json" };

  // Read missing job -> 404
  const getRes = await fetch(`${baseUrl}/api/candidate/job/non-existent-id`, { headers });
  assert.equal(getRes.status, 404);

  // Save missing job -> 404
  const saveRes = await fetch(`${baseUrl}/api/candidate/job/save/non-existent-id`, {
    method: "POST",
    headers,
  });
  assert.equal(saveRes.status, 404);

  // Apply to missing job -> 400
  const applyRes = await fetch(`${baseUrl}/api/candidate/job/apply/non-existent-id`, {
    method: "POST",
    headers,
    body: JSON.stringify({ coverLetter: "Hello" }),
  });
  assert.equal(applyRes.status, 400);

  // Remove saved job -> 200
  const removeRes = await fetch(`${baseUrl}/api/candidate/job/non-existent-id`, {
    method: "DELETE",
    headers,
  });
  assert.equal(removeRes.status, 200);
});

test("Admin routes enforce authentication and role", async () => {
  // Unauthenticated
  const unauthRes = await fetch(`${baseUrl}/api/admin/jobs`);
  assert.equal(unauthRes.status, 401);

  // Wrong role (candidate)
  const candidateToken = createTokenPair({ id: "cand_1", role: "JOB_SEEKER" }).accessToken;
  const candRes = await fetch(`${baseUrl}/api/admin/jobs`, {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  assert.equal(candRes.status, 403);

  // Wrong role (recruiter)
  const recruiterToken = createTokenPair({ id: "rec_1", role: "EMPLOYER" }).accessToken;
  const recRes = await fetch(`${baseUrl}/api/admin/jobs`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  assert.equal(recRes.status, 403);

  // Correct role (admin)
  const adminToken = createTokenPair({ id: "admin_1", role: "ADMIN" }).accessToken;
  const adminRes = await fetch(`${baseUrl}/api/admin/jobs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(adminRes.status, 200);
  const json = await adminRes.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data.jobs));
});

test("Admin route returns 404 for missing job", async () => {
  const adminToken = createTokenPair({ id: "admin_1", role: "ADMIN" }).accessToken;
  const res = await fetch(`${baseUrl}/api/admin/job/missing-job-id`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(res.status, 404);
});

test("Upload route enforces authentication and validation", async () => {
  // 1. Unauthenticated upload request rejected
  const unauthRes = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
  });
  assert.equal(unauthRes.status, 401);

  // 2. Authenticated but missing file
  const candidateToken = createTokenPair({ id: "cand_1", role: "JOB_SEEKER" }).accessToken;
  const noFileFormData = new FormData();
  const noFileRes = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: noFileFormData,
  });
  assert.equal(noFileRes.status, 400);
  const noFileJson = await noFileRes.json();
  assert.equal(noFileJson.success, false);

  // 3. Rejected unsupported file type (e.g. text/plain or malformed binary)
  const badFormData = new FormData();
  const badFile = new Blob(["not a real image content"], { type: "text/plain" });
  badFormData.append("image", badFile, "test.txt");
  const badRes = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: badFormData,
  });
  assert.equal(badRes.status, 400);

  // 4. Role authorization: Job seeker cannot upload to 'companies'
  const fakePng = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d])], { type: "image/png" });
  const companyFormData = new FormData();
  companyFormData.append("image", fakePng, "logo.png");
  companyFormData.append("category", "companies");
  const candCompanyRes = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: companyFormData,
  });
  assert.equal(candCompanyRes.status, 403);
  const candCompJson = await candCompanyRes.json();
  assert.equal(candCompJson.success, false);

  // 5. Delete route rejects unauthenticated request
  const unauthDeleteRes = await fetch(`${baseUrl}/api/upload`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId: "job-portal/profiles/sample" }),
  });
  assert.equal(unauthDeleteRes.status, 401);

  // 6. Delete route rejects publicId outside 'job-portal/'
  const badPublicIdRes = await fetch(`${baseUrl}/api/upload`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${candidateToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publicId: "other-folder/secret-image" }),
  });
  assert.equal(badPublicIdRes.status, 403);
});
