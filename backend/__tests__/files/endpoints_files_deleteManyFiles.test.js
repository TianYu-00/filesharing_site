const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
const { fetchFullUploadPath } = require("../../src/pathHandler");
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

/////////////////////////////////////////////////////////////////////////// DELETE MANY FILES
describe("DELETE /api/files/delete-many/files", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).delete(`/api/files/delete-many/files`).expect(401);
  });

  test("should return 400 status code, when files passed in is empty", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const listOfFiles = [];

    await request(app)
      .delete(`/api/files/delete-many/files`)
      .send({ files: listOfFiles })
      .set("Cookie", cookies)
      .expect(400);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).post("/api/files/upload").set("Cookie", cookies).attach("file", testFilePath).expect(200);
    await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(403);
  });

  test("should return 403 status code, indicating some files do not belong to the user", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: filesResponse } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);

    const listOfFiles = filesResponse.data;
    const tempFakeFile = {
      id: 2,
      fieldname: "file",
      originalname: "fake_file123.txt",
      encoding: "7bit",
      mimetype: "application/octet-stream",
      destination: "/1",
      filename: "1736058402877-712487319-fake_file123.txt",
      path: "/1/1736058402877-712487319-fake_file123.txt",
      size: 29,
      user_id: 2,
      created_at: "2025-01-05T06:26:44.968Z",
      favourite: false,
      trash: false,
    };
    listOfFiles.push(tempFakeFile);

    await request(app)
      .delete("/api/files/delete-many/files")
      .send({ files: listOfFiles })
      .set("Cookie", cookies)
      .expect(403);
  });

  test("should return 200 status code, indicating successful response", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: filesResponse } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);

    const listOfFiles = filesResponse.data;

    await request(app)
      .delete(`/api/files/delete-many/files`)
      .send({ files: listOfFiles })
      .set("Cookie", cookies)
      .expect(200);
  });

  test("should verify the files has been removed from database", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: filesResponse } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);

    const listOfFiles = filesResponse.data;

    await request(app)
      .delete(`/api/files/delete-many/files`)
      .send({ files: listOfFiles })
      .set("Cookie", cookies)
      .expect(200);

    const { body: filesAfterDeletion } = await request(app)
      .get("/api/users/1/files")
      .set("Cookie", cookies)
      .expect(200);

    expect(filesAfterDeletion.data).not.toEqual(expect.arrayContaining(listOfFiles));
  });

  test("should verify the file has been removed from uploads directory", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const { body: filesResponse } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);

    const filePaths = filesResponse.data.map((file) => fetchFullUploadPath(file.path));

    await request(app)
      .delete("/api/files/delete-many/files")
      .send({ files: filesResponse.data })
      .set("Cookie", cookies)
      .expect(200);

    filePaths.forEach((filePath) => {
      const fileExists = fs.existsSync(filePath);
      expect(fileExists).toBe(false);
    });
  });
});
