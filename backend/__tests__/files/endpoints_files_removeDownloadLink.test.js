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

/////////////////////////////////////////////////////////////////////////// REMOVE DOWNLOAD LINK BY LINK ID
describe("DELETE /api/files/download-links/:link_id", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).delete(`/api/files/download-links/1`).expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const { body: uploadResponse } = await request(app)
      .post("/api/files/upload")
      .attach("file", testFilePath)
      .expect(200);
    const newLinkId = uploadResponse.data.downloadLink.id;

    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete(`/api/files/download-links/${newLinkId}`).set("Cookie", cookies).expect(403);
  });

  test("should return 400 status code, indicating invalid link id", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete("/api/files/download-links/invalid-link-id").set("Cookie", cookies).expect(400);
  });

  test("should return 404 status code, indicating link not found", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).delete("/api/files/download-links/0").set("Cookie", cookies).expect(404);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: createDownloadLinkResponse } = await request(app)
      .post("/api/files/1/download-link")
      .set("Cookie", cookies)
      .expect(200);
    const downloadLinkId = createDownloadLinkResponse.data.id;
    const { body } = await request(app)
      .delete(`/api/files/download-links/${downloadLinkId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(body.success).toBe(true);
  });

  test("should verify download link has been removed successfully", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: createDownloadLinkResponse } = await request(app)
      .post("/api/files/1/download-link")
      .set("Cookie", cookies)
      .expect(200);
    const downloadLinkId = createDownloadLinkResponse.data.id;
    const { body: removeDownloadLinkResponse } = await request(app)
      .delete(`/api/files/download-links/${downloadLinkId}`)
      .set("Cookie", cookies)
      .expect(200);

    const fileId = removeDownloadLinkResponse.data.file_id;
    const { body } = await request(app).get(`/api/files/${fileId}/download-links`).set("Cookie", cookies).expect(200);

    const linkIds = body.data.map((link) => link.id);
    expect(linkIds).not.toContain(downloadLinkId);
  });
});
