const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");
afterAll(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  return db.end();
});

beforeEach(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// VALIDATE DOWNLOAD LINK PASSWORD
describe("POST /api/files/download-links/:link_id/validate-password", () => {
  test("should return 400 status code, indicating invalid link id", async () => {
    await request(app).post("/api/files/download-links/invalid-link-id/validate-password").expect(400);
  });

  test("should return 404 status code, indicating link not found", async () => {
    await request(app).post("/api/files/download-links/000/validate-password").expect(404);
  });

  test("should return 404 status code, indicating password is missing", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const bodyData = {
      password: "password",
    };

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).send(bodyData).expect(200);

    await request(app).post("/api/files/download-links/1/validate-password").expect(404);
  });

  test("should return 200 status code, indicating successful response and password is correct", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const bodyData = {
      password: "password",
    };

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).send(bodyData).expect(200);

    const { body } = await request(app)
      .post("/api/files/download-links/1/validate-password")
      .send(bodyData)
      .expect(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ isPasswordCorrect: true });
  });

  test("should return 401 status code, indicating unauthorized due to incorrect password", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const bodyData = {
      password: "password",
    };

    await request(app).post("/api/files/1/download-link").set("Cookie", cookies).send(bodyData).expect(200);

    const { body } = await request(app)
      .post("/api/files/download-links/1/validate-password")
      .send({ password: "incorrect-password" })
      .expect(401);
    expect(body.success).toBe(false);
  });
});
