const { app, request, db } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

describe("GET api/test", () => {
  test("should return a 200 status code, indicating the endpoint is accessible", async () => {
    try {
      await request(app).get("/api/test").expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return the correct body value", async () => {
    try {
      const expected = { success: true, msg: "Hello World!", data: null };
      const { body } = await request(app).get("/api/test").expect(200);
      expect(body).toEqual(expected);
    } catch (error) {
      throw error;
    }
  });
});
