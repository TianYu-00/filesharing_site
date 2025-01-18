const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
const fs = require("fs");

afterAll(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  return db.end();
});

beforeEach(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FILE DELETE
describe("DELETE /api/files/:file_id", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).delete(`/api/files/1`).expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete(`/api/files/1`).set("Cookie", cookies).expect(403);
  });

  test("should return 400 status code, indicating invalid file id", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete("/api/files/invalid-file-id").set("Cookie", cookies).expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete("/api/files/0").set("Cookie", cookies).expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete(`/api/files/1`).set("Cookie", cookies).expect(200);
  });

  test("should return success = true", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app).delete(`/api/files/1`).set("Cookie", cookies).expect(200);
    expect(body.success).toBe(true);
  });

  test("should verify the file has been removed from database", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).delete(`/api/files/1`).set("Cookie", cookies).expect(200);

    const { body: filesResponse } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);
    const updatedFileIds = filesResponse.data.map((file) => file.id);
    expect(updatedFileIds).not.toContain(1);
  });

  test("should verify the file has been removed from uploads directory", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: filesResponse } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);
    const originalFilePath = fetchFullUploadPath(filesResponse.data[0].path);
    await request(app).delete(`/api/files/1`).set("Cookie", cookies).expect(200);
    const fileExists = fs.existsSync(originalFilePath);
    expect(fileExists).toBe(false);
  });
});
