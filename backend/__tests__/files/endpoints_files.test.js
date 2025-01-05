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
xdescribe("GET /api/files", () => {
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

/////////////////////////////////////////////////////////////////////////// FILE INFO
xdescribe("GET /api/files/:file_id/info", () => {
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
xdescribe("POST /api/files/upload", () => {
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

/////////////////////////////////////////////////////////////////////////// FILE DOWNLOAD
xdescribe("GET /api/files/:file_id/download", () => {
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

  // note:
  // test download link password later
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
