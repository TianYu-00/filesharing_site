const { app, request, db, seed, data } = require("../../testIndex");
const jwt = require("jsonwebtoken");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// BLACKLIST TOKENS
describe("GET api/auth/blacklist-tokens", () => {
  test("should return a 200 status code, indicating the list of blacklisted tokens has been fetched", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).get("/api/auth/blacklist-tokens").set("Cookie", cookies).expect(200);
  });

  test("should return success = true", async () => {
    const tempUserLoginCredentials = data.users[1];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const { body } = await request(app).get("/api/auth/blacklist-tokens").set("Cookie", cookies);

    expect(body.success).toBe(true);
  });
});
