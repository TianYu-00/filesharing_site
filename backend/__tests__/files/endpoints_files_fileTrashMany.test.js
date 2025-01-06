const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
afterAll(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  return db.end();
});

beforeEach(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FILE TRASH MANY
describe("PATCH /api/files/trash-many/files", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).patch(`/api/files/trash-many/files`).expect(401);
  });

  test("should return 400 status code, when files passed in is empty", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const listOfFiles = [];
    const newTrashState = true;

    await request(app)
      .patch(`/api/files/trash-many/files`)
      .send({ files: listOfFiles, trash: newTrashState })
      .set("Cookie", cookies)
      .expect(400);
  });

  test("should return 400 status code, when trash state is empty", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const listOfFiles = [];

    await request(app)
      .patch(`/api/files/trash-many/files`)
      .send({ files: listOfFiles })
      .set("Cookie", cookies)
      .expect(400);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
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
    const newTrashState = true;

    await request(app)
      .patch("/api/files/trash-many/files")
      .send({ files: listOfFiles, trash: newTrashState })
      .set("Cookie", cookies)
      .expect(403);
  });

  test("should return 200 status code, indicating successful response with correct data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body: filesResponse } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);

    const listOfFiles = filesResponse.data;
    const newTrashState = true;

    const { body } = await request(app)
      .patch(`/api/files/trash-many/files`)
      .send({ files: listOfFiles, trash: newTrashState })
      .set("Cookie", cookies)
      .expect(200);

    const allFilesHaveNewTrashState = body.data.every((file) => file.trash === newTrashState);
    expect(allFilesHaveNewTrashState).toBe(true);
    expect(body.success).toBe(true);
  });
});
