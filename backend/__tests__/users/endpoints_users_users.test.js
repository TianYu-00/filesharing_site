const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// USERS
describe("GET /api/users", () => {
  test("should return a 403 status code, indicating users cannot access the list of all users", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/users").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating an admin successfully retrieves the list of all users", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body } = await request(app).get("/api/users").set("Cookie", cookies).expect(200);
    expect(body.data).toHaveLength(3);
  });

  test("should return success = true", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body } = await request(app).get("/api/users").set("Cookie", cookies).expect(200);
    expect(body.success).toBe(true);
  });
});
