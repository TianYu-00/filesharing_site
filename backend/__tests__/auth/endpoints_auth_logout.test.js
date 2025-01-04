const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// LOGOUT
describe("POST api/auth/logout", () => {
  test("should return a 200 status code, indicating user logout is successful", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      await request(app).post("/api/auth/logout").set("Cookie", cookies).expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 401 status code, indicating the user is not logged in", async () => {
    try {
      await request(app).post("/api/auth/logout").expect(401);
    } catch (error) {
      throw error;
    }
  });
});