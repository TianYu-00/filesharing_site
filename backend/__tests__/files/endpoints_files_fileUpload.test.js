const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
const { testBaseUploadDir } = require("../../src/pathHandler");
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

/////////////////////////////////////////////////////////////////////////// FILE UPLOAD
describe("POST /api/files/upload", () => {
  test("should return 400 status code, indicating file is missing", async () => {
    const { body } = await request(app).post("/api/files/upload").expect(400);
    expect(body.success).toBe(false);
    expect(body.msg).toBe("File was not provided");
  });

  test("should return 200 status code, indicating file has been uploaded", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    expect(body.success).toBe(true);
    expect(body.msg).toBe("File has been uploaded");
  });

  test("should return 200 status code and contain file details with user id of null (guest upload)", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    expect(body.data).toHaveProperty("file");
    expect(body.data.file).toMatchObject({
      user_id: null,
    });
  });

  test("should return 200 status code and contain download link details", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    expect(body.data).toHaveProperty("downloadLink");
  });

  test("should return 200 status code and contain file details with user id of x (user upload)", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    expect(body.data).toHaveProperty("file");
    expect(body.data.file).toMatchObject({
      user_id: loginResponse.body.data.id,
    });
  });

  test("should be able to detect the file in uploads directory when successful (guest)", async () => {
    const { body } = await request(app).post("/api/files/upload").attach("file", testFilePath).expect(200);
    const fileDirectory = path.join(testBaseUploadDir, "guests", body.data.file.filename);
    expect(fs.existsSync(fileDirectory)).toBe(true);
  });

  test("should be able to detect the file in uploads directory when successful (user)", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body } = await request(app)
      .post("/api/files/upload")
      .set("Cookie", cookies)
      .attach("file", testFilePath)
      .expect(200);
    const fileDirectory = path.join(testBaseUploadDir, body.data.file.user_id.toString(), body.data.file.filename);
    expect(fs.existsSync(fileDirectory)).toBe(true);
  });
});
