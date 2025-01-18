const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// VERIFY USER TOKEN
describe("GET api/auth/verify-user-token", () => {
  test("should return a 401 status code, indicating the user is not logged in", async () => {
    try {
      await request(app).get("/api/auth/verify-user-token").expect(401);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 200 status code, indicating the user is logged in", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      await request(app).get("/api/auth/verify-user-token").set("Cookie", cookies).expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return success = true", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      const { body } = await request(app).get("/api/auth/verify-user-token").set("Cookie", cookies).expect(200);
      expect(body.success).toBe(true);
    } catch (error) {
      throw error;
    }
  });
});
