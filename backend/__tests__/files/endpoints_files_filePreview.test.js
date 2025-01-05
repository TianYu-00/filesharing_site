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

/////////////////////////////////////////////////////////////////////////// FILE PREVIEW
describe("GET /api/files/:file_id/preview", () => {
  test("should return 400 status code, indicating invalid file id", async () => {
    await request(app).get("/api/files/invalid-file-id/preview").expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    await request(app).get("/api/files/0/preview").expect(404);
  });

  test(
    "should allow the file owner to preview the file without a link",
    async () => {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];

      const { body: uploadResponse } = await request(app)
        .post("/api/files/upload")
        .set("Cookie", cookies)
        .attach("file", testFilePath)
        .expect(200);
      const fileId = uploadResponse.data.file.id;

      await request(app).get(`/api/files/${fileId}/preview`).set("Cookie", cookies).expect(200);
    },
    15 * 1000
  );

  test(
    "should allow the user to preview the file with a link query",
    async () => {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      const { body: uploadResponse } = await request(app)
        .post("/api/files/upload")
        .set("Cookie", cookies)
        .attach("file", testFilePath)
        .expect(200);
      const fileId = uploadResponse.data.file.id;
      const fileLink = uploadResponse.data.downloadLink.download_url;

      await request(app).get(`/api/files/${fileId}/preview?link=${fileLink}`).expect(200);
    },
    15 * 1000
  );

  test(
    "should allow the user to preview the protected file with a link query and password",
    async () => {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      const tempPassword = "12345";
      const bodyData = { password: tempPassword };

      const { body } = await request(app)
        .post("/api/files/1/download-link")
        .set("Cookie", cookies)
        .send(bodyData)
        .expect(200);
      // console.log(body);
      const fileId = body.data.file_id;
      const fileLink = body.data.download_url;

      await request(app).get(`/api/files/${fileId}/preview?link=${fileLink}&password=${tempPassword}`).expect(200);
    },
    15 * 1000
  );

  test(
    "should not allow the user to preview the protected file when password is incorrect",
    async () => {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      const tempPassword = "12345";
      const bodyData = { password: tempPassword };

      const { body } = await request(app)
        .post("/api/files/1/download-link")
        .set("Cookie", cookies)
        .send(bodyData)
        .expect(200);
      // console.log(body);
      const fileId = body.data.file_id;
      const fileLink = body.data.download_url;
      const incorrect_password = "x1x1x1";

      await request(app)
        .get(`/api/files/${fileId}/preview?link=${fileLink}&password=${incorrect_password}`)
        .expect(403);
    },
    15 * 1000
  );

  test(
    "should not allow the user to preview the protected file when password is missing",
    async () => {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      const tempPassword = "12345";
      const bodyData = { password: tempPassword };

      const { body } = await request(app)
        .post("/api/files/1/download-link")
        .set("Cookie", cookies)
        .send(bodyData)
        .expect(200);
      // console.log(body);
      const fileId = body.data.file_id;
      const fileLink = body.data.download_url;

      await request(app).get(`/api/files/${fileId}/preview?link=${fileLink}`).expect(401);
    },
    15 * 1000
  );

  test(
    "should not allow the user to preview the protected file when link is missing",
    async () => {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      const tempPassword = "12345";
      const bodyData = { password: tempPassword };

      const { body } = await request(app)
        .post("/api/files/1/download-link")
        .set("Cookie", cookies)
        .send(bodyData)
        .expect(200);
      const fileId = body.data.file_id;

      await request(app).get(`/api/files/${fileId}/preview?password=${tempPassword}`).expect(400);
    },
    15 * 1000
  );
});
