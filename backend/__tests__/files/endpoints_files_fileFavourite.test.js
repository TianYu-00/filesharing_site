const { app, request, db, seed, data, cleanupFolder } = require("../../testIndex");

afterAll(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  return db.end();
});

beforeEach(async () => {
  await cleanupFolder.cleanUploadsTestFolder();
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FILE FAVOURITE
describe("PATCH /api/files/:file_id/favourite", () => {
  test("should return 401 status code, indicating unauthorized (not logged in)", async () => {
    await request(app).patch(`/api/files/1/favourite`).send({ favourite: false }).expect(401);
  });

  test("should return 403 status code, indicating forbidden access (logged in but not the owner)", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch(`/api/files/1/favourite`).send({ favourite: false }).set("Cookie", cookies).expect(403);
  });

  test("should return 400 status code, indicating invalid file id", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app)
      .patch("/api/files/invalid-file-id/favourite")
      .send({ favourite: false })
      .set("Cookie", cookies)
      .expect(400);
  });

  test("should return 404 status code, indicating file not found", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    await request(app).patch("/api/files/0/favourite").send({ favourite: false }).set("Cookie", cookies).expect(404);
  });

  test("should return 200 status code, indicating successful response with correct data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];

    const newFavouriteState = true;
    const { body } = await request(app)
      .patch("/api/files/1/favourite")
      .send({ favourite: newFavouriteState })
      .set("Cookie", cookies)
      .expect(200);
    expect(body.success).toBe(true);
    expect(body.data.favourite).toBe(newFavouriteState);
  });
});
