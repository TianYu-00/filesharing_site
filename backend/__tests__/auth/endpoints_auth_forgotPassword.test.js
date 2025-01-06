const { app, request, db, seed, data } = require("../../testIndex");
const jwt = require("jsonwebtoken");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FORGOT PASSWORD
describe("POST api/auth/forgot-password", () => {
  test("should return a 400 status code, indicating the email is missing", async () => {
    try {
      const tempBody = { email: "" };
      await request(app).post("/api/auth/forgot-password").send(tempBody).expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 404 status code, indicating the email is not registered", async () => {
    try {
      const tempBody = { email: "fakeemail@example.com" };
      await request(app).post("/api/auth/forgot-password").send(tempBody).expect(404);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 200 status code, indicating the email is sent", async () => {
    try {
      const tempBody = { email: data.users[0].email };
      await request(app).post("/api/auth/forgot-password").send(tempBody).expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return success = true", async () => {
    const tempBody = { email: data.users[0].email };
    const { body } = await request(app).post("/api/auth/forgot-password").send(tempBody);
    expect(body.success).toBe(true);
  });

  test("should return a 200 status code, indicating the token is valid and is correct type", async () => {
    try {
      const tempBody = { email: data.users[0].email };
      const sendEmailResponse = await request(app).post("/api/auth/forgot-password").send(tempBody).expect(200);
      const token = sendEmailResponse.body.data.text;
      const decodedToken = jwt.verify(token, process.env.JWT_USER_PASSWORD_RESET_SECRET);
      expect(decodedToken).toHaveProperty("tokenType", "forgot_password");
    } catch (error) {
      throw error;
    }
  });
});
