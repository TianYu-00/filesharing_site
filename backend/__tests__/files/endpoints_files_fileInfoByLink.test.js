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

/////////////////////////////////////////////////////////////////////////// FILE INFO BY LINK
describe("GET /api/files/download-links/:download_link/file-info", () => {
  test("should return 404 status code, indicating file details not found", async () => {
    await request(app).get("/api/files/download-links/invalid-link/file-info").expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
  });

  test("should return success = true", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
    expect(body.success).toBe(true);
  });

  test("should return 200 status code and contain file details", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
    // console.log(body.data);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      fieldname: expect.any(String),
      originalname: expect.any(String),
      encoding: expect.any(String),
      mimetype: expect.any(String),
      size: expect.any(Number),
      user_id: null,
      created_at: expect.any(String),
    });
  });

  test("should return 200 status code and contain file details with user id of x (user upload)", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
    expect(body.data).toMatchObject({
      user_id: loginResponse.body.data.id,
    });
  });

  test("should return 200 status code and contain file details with user id of null (guest upload)", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/file-info`).expect(200);
    expect(body.data).toMatchObject({
      user_id: null,
    });
  });
});
