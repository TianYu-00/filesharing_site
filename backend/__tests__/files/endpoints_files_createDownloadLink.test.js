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

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINK CREATION BY FILE ID
describe("POST /api/files/:file_id/download-link", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).post("/api/files/1/download-link").expect(401);
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

    await request(app).post(`/api/files/${newUploadId}/download-link`).set("Cookie", cookies).expect(403);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).expect(200);
  });

  test("should return success = true", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app).post("/api/files/1/download-link").set("Cookie", cookies).expect(200);
    expect(body.success).toBe(true);
  });

  test("should return 200 status code and contain download link details", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app).post("/api/files/1/download-link").set("Cookie", cookies).expect(200);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      file_id: expect.any(Number),
      download_url: expect.any(String),
      created_at: expect.any(String),
      expires_at: null,
      download_count: expect.any(Number),
      download_limit: null,
    });
  });

  test("should return 200 status code and contain download link details with expires_at, download_limit", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const newDateNow = new Date().toISOString();
    const bodyData = {
      expires_at: newDateNow,
      download_limit: 5,
    };

    const { body } = await request(app)
      .post("/api/files/1/download-link")
      .set("Cookie", cookies)
      .send(bodyData)
      .expect(200);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      file_id: expect.any(Number),
      download_url: expect.any(String),
      created_at: expect.any(String),
      expires_at: newDateNow,
      download_count: 0,
      download_limit: 5,
    });
  });
});
