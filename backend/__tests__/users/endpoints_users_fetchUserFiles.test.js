const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FETCH USER FILES
describe("GET /api/users/:user_id/files", () => {
  test("should return a 403 status code, indicating a user cannot access another user's files", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/users/2/files").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating a user successfully retrieves their own files", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body } = await request(app).get("/api/users/1/files").set("Cookie", cookies).expect(200);
    expect(body.data).toHaveLength(0);
  });
});
