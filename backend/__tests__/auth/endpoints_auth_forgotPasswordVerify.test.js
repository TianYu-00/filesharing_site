const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// FORGOT PASSWORD VERIFY
describe("POST api/auth/forgot-password/verify", () => {
  test("should return a 400 status code, indicating the token is missing", async () => {
    try {
      await request(app).post("/api/auth/forgot-password/verify").expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 200 status code, indicating the token has been verified successfully", async () => {
    try {
      const tempBody = { email: data.users[0].email };
      const sendEmailResponse = await request(app).post("/api/auth/forgot-password").send(tempBody).expect(200);
      const token = sendEmailResponse.body.data.text;
      await request(app).post("/api/auth/forgot-password/verify").send({ forgotPasswordToken: token }).expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return success = true", async () => {
    const tempBody = { email: data.users[0].email };
    const sendEmailResponse = await request(app).post("/api/auth/forgot-password").send(tempBody).expect(200);
    const token = sendEmailResponse.body.data.text;
    const { body } = await request(app)
      .post("/api/auth/forgot-password/verify")
      .send({ forgotPasswordToken: token })
      .expect(200);
    expect(body.success).toBe(true);
  });
});
