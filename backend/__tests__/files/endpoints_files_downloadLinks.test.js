const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
const path = require("path");
const testFileName = "test123.txt";
const testFilePath = path.join(__dirname, "..", "..", "db", "test_data", "test_files", testFileName);

afterAll(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  return db.end();
});

beforeEach(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINKS BY FILE ID
describe("GET /api/files/:file_id/download-links", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).get("/api/files/1/download-links").expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const newUploadId = uploadResponse.data.file.id;

    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).get(`/api/files/${newUploadId}/download-links`).set("Cookie", cookies).expect(403);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).get("/api/files/1/download-links").set("Cookie", cookies).expect(200);
  });

  test("should return success = true", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app).get("/api/files/1/download-links").set("Cookie", cookies).expect(200);
    expect(body.success).toBe(true);
  });
});
