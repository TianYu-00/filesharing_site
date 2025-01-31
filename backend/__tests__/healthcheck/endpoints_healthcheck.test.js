const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

describe("GET /api/health-check", () => {
  test("should return 200 and a success message if the database is awake", async () => {
    const response = await request(app).get("/api/health-check");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Database is awake and healthy.",
      data: null,
    });
  });
});
