const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
const { testBaseUploadDir, createRelativePath, createFileNameWithSuffix } = require("../../src/pathHandler");
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

/////////////////////////////////////////////////////////////////////////// FILES
describe("GET /api/files", () => {
  test("should return a 403 status code, indicating users cannot access the list of all users", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating an admin successfully retrieves the list of all files", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files").set("Cookie", cookies).expect(200);
  });
});

describe("GET /api/files/:file_id/info", () => {
  test("should return a 403 status code, indicating users cannot access file info", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files/1/info").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating an admin successfully retrieves file info", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body } = await request(app).get("/api/files/1/info").set("Cookie", cookies).expect(200);
    expect(body.data).toMatchObject({
      fieldname: expect.any(String),
      originalname: expect.any(String),
      encoding: expect.any(String),
      mimetype: expect.any(String),
      destination: expect.any(String),
      filename: expect.any(String),
      path: expect.any(String),
      size: expect.any(Number),
      user_id: expect.any(Number),
      created_at: expect.any(String),
      favourite: expect.any(Boolean),
      trash: expect.any(Boolean),
    });
  });

  test("should return a 404 status code, indicating the file does not exist", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files/100/info").set("Cookie", cookies).expect(404);
  });

  test("should return a 400 status code, indicating the file ID is invalid", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/files/invalid-id/info").set("Cookie", cookies).expect(400);
  });
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
