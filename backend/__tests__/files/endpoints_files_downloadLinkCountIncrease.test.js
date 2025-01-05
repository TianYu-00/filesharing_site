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

/////////////////////////////////////////////////////////////////////////// DOWNLOAD LINK COUNT INCREASE BY LINK ID
describe("PATCH /api/files/download-links/:link_id/increase-download-count", () => {
  test("should return 400 status code, indicating invalid file id", async () => {
    await request(app).patch("/api/files/download-links/invalid-link-id/increase-download-count").expect(400);
  });

  test("should return 404 status code, indicating link not found", async () => {
    await request(app).patch("/api/files/download-links/000/increase-download-count").expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body } = await request(app).get(`/api/files/download-links/${downloadLink}/details`).expect(200);
    const linkId = body.data.id;

    await request(app).patch(`/api/files/download-links/${linkId}/increase-download-count`).expect(200);
  });

  test("should verify that the download count has increased by 1", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const downloadLink = uploadResponse.data.downloadLink.download_url;

    const { body: detailsResponse } = await request(app)
      .get(`/api/files/download-links/${downloadLink}/details`)
      .expect(200);
    const linkId = detailsResponse.data.id;
    const initialDownloadCount = detailsResponse.data.download_count;

    await request(app).patch(`/api/files/download-links/${linkId}/increase-download-count`).expect(200);

    const { body: updatedDetailsResponse } = await request(app)
      .get(`/api/files/download-links/${downloadLink}/details`)
      .expect(200);
    const updatedDownloadCount = updatedDetailsResponse.data.download_count;

    expect(updatedDownloadCount).toBe(initialDownloadCount + 1);
  });

  test("should return 403 status code, indicating download limit exceeded", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const bodyData = {
      download_limit: 1,
    };

    await request(app).post("/api/files/1/download-link").send(bodyData).set("Cookie", cookies).expect(200);
    // increase 1
    await request(app).patch(`/api/files/download-links/1/increase-download-count`).expect(200);
    // since we set the limit to 1 and we already increased the download count by 1, the next increase should fail
    await request(app).patch(`/api/files/download-links/1/increase-download-count`).expect(403);
  });
});
