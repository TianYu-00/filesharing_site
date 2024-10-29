const { app, request } = require("../testIndex");

describe("GET /test", () => {
  it("should return Hello World!", () => {
    return request(app)
      .get("/test")
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe("Hello World!");
      });
  });
});

describe("GET /api", () => {
  it("should return a true success response", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.success).toBe(true);
      });
  });
});
