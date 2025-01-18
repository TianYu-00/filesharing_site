const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// RESET PASSWORD
describe("PATCH api/auth/reset-password", () => {
  test("should return a 400 status code, indicating the token is missing", async () => {
    try {
      await request(app).patch("/api/auth/reset-password").expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 400 status code, indicating the password is missing", async () => {
    try {
      const tempBody = { email: data.users[0].email };
      const sendEmailResponse = await request(app).post("/api/auth/forgot-password").send(tempBody).expect(200);
      const token = sendEmailResponse.body.data.text;
      await request(app)
        .patch("/api/auth/reset-password")
        .send({ forgotPasswordToken: token, password: "" })
        .expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 200 status code, indicating the password has been changed successfully", async () => {
    try {
      const tempBody = { email: data.users[0].email };
      const sendEmailResponse = await request(app).post("/api/auth/forgot-password").send(tempBody).expect(200);
      const token = sendEmailResponse.body.data.text;
      await request(app)
        .patch("/api/auth/reset-password")
        .send({ forgotPasswordToken: token, password: "12345678" })
        .expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return success = true", async () => {
    try {
      const tempBody = { email: data.users[0].email };
      const sendEmailResponse = await request(app).post("/api/auth/forgot-password").send(tempBody).expect(200);
      const token = sendEmailResponse.body.data.text;
      const { body } = await request(app)
        .patch("/api/auth/reset-password")
        .send({ forgotPasswordToken: token, password: "12345678" })
        .expect(200);
      expect(body.success).toBe(true);
    } catch (error) {
      throw error;
    }
  });
});
