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
    await request(app).get("/api/auth/blacklist-tokens").expect(200);
  });

  test("should return success = true", async () => {
    const { body } = await request(app).get("/api/auth/blacklist-tokens");
    expect(body.success).toBe(true);
  });
});
