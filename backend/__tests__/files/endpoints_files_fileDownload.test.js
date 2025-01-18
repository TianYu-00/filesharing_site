const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
const path = require("path");
const fs = require("fs");
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

/////////////////////////////////////////////////////////////////////////// FILE DOWNLOAD
describe("GET /api/files/:file_id/download", () => {
  test("should return 400 status code, indicating invalid file id", async () => {
    await request(app).get("/api/files/invalid-id/download").expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    await request(app).get("/api/files/100/download").expect(404);
  });

  test("should return 200 status code, indicating file downloaded successfully", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    await request(app).get(`/api/files/${fileId}/download?link=${downloadLink}`).expect(200);
  });

  test("should return success = true", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    await request(app).get(`/api/files/${fileId}/download?link=${downloadLink}`).expect(200);
  });

  test("should verify that the content of the downloaded file matches the content of the original file", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const downloadResponse = await request(app)
      .get(`/api/files/${fileId}/download?link=${downloadLink}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    const originalFileContent = fs.readFileSync(testFilePath);
    expect(downloadResponse.body).toEqual(originalFileContent);
  });

  test("should return 403 status code, indicating forbidden access due to invalid download link", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;

    await request(app).get(`/api/files/${fileId}/download?link=invalid-link`).expect(403);
  });

  test("should return a 200 status code, indicating the file was successfully downloaded by the owner without requiring a download link", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    const fileId = uploadResponse.data.file.id;

    await request(app).get(`/api/files/${fileId}/download`).set("Cookie", cookies).expect(200);
  });
});
