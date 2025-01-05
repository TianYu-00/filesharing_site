const { app, request, db } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

describe("GET api/", () => {
  test("should return 404, with message indicating the route is not found", async () => {
    try {
      const { body } = await request(app).get("/invalid-route").expect(404);
      expect(body.msg).toBe("ROUTE NOT FOUND");
    } catch (error) {
      throw error;
    }
  });

  test("should return a 200 status code, indicating the endpoint is accessible", async () => {
    try {
      await request(app).get("/api").expect(200);
    } catch (error) {
      throw error;
    }
  });
});
