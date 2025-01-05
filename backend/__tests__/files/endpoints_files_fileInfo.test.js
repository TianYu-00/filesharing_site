const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");

afterAll(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  return db.end();
});

beforeEach(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FILE INFO
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
