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

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINK INFO BY LINK
describe("GET /api/files/download-links/:download_link/details", () => {
  test("should return 404 status code, indicating download link details not found", async () => {
    await request(app).get("/api/files/download-links/invalid-link/details").expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    await request(app).get(`/api/files/download-links/${downloadLink}/details`).expect(200);
  });

  test("should return should return success = true", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/details`).expect(200);
    expect(body.success).toBe(true);
  });

  test("should return 200 status code and contain download link details", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/details`).expect(200);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      file_id: expect.any(Number),
      download_url: expect.any(String),
      created_at: expect.any(String),
      expires_at: expect.any(String),
      password: expect.any(Boolean),
      download_count: expect.any(Number),
    });
  });
});
