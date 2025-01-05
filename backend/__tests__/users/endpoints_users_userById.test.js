const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// USER BY ID
describe("GET /api/users/:user_id", () => {
  test("should return a 403 status code, indicating a user cannot access another user's data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/users/2").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating the user successfully accesses their own data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body } = await request(app).get("/api/users/1").set("Cookie", cookies).expect(200);
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      username: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
      created_at: expect.any(String),
      role: expect.any(String),
    });
  });
});
