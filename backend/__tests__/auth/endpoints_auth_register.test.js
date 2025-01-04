const { app, request, db, seed, data } = require("../../testIndex");
const jwt = require("jsonwebtoken");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// REGISTER
describe("POST api/auth/register", () => {
  test("should return a 400 status code, indicating the user credentials is missing (username)", async () => {
    try {
      const tempUserCredentials = {
        email: "testemail@example.com",
        password: "password",
      };
      await request(app).post("/api/auth/register").send(tempUserCredentials).expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 400 status code, indicating the user credentials is missing (email)", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        password: "password",
      };
      await request(app).post("/api/auth/register").send(tempUserCredentials).expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 400 status code, indicating the user credentials is missing (password)", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        email: "testemail@example.com",
      };
      await request(app).post("/api/auth/register").send(tempUserCredentials).expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 200 status code, indicating user registration is successful", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        email: "testemail@example.com",
        password: "password",
      };
      await request(app).post("/api/auth/register").send(tempUserCredentials).expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 409 status code, indicating the user already exists", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        email: "testemail@example.com",
        password: "password",
      };
      await request(app).post("/api/auth/register").send(tempUserCredentials).expect(200);
      await request(app).post("/api/auth/register").send(tempUserCredentials).expect(409);
    } catch (error) {
      throw error;
    }
  });

  test("should return the correct user details", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        email: "testemail@example.com",
        password: "password",
      };
      const { body } = await request(app).post("/api/auth/register").send(tempUserCredentials).expect(200);
      const expected = {
        username: "test user",
        email: "testemail@example.com",
      };
      expect(body.data).toEqual(expect.objectContaining(expected));
    } catch (error) {
      throw error;
    }
  });

  test("should have cookies after registering", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        email: "testemail@example.com",
        password: "password",
      };
      const registerResponse = await request(app).post("/api/auth/register").send(tempUserCredentials).expect(200);
      const cookies = registerResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();
    } catch (error) {
      throw error;
    }
  });

  test("should have valid refresh token cookie after registering", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        email: "testemail@example.com",
        password: "password",
      };
      const registerResponse = await request(app).post("/api/auth/register").send(tempUserCredentials).expect(200);
      const refreshToken = registerResponse.headers["set-cookie"]
        .find((cookie) => cookie.startsWith("refreshToken="))
        .split(";")[0]
        .split("=")[1];

      const decodedToken = jwt.verify(refreshToken, process.env.JWT_USER_REFRESH_TOKEN_SECRET);
      expect(decodedToken).toHaveProperty("userId");
    } catch (error) {
      throw error;
    }
  });

  test("should have valid access token cookie after registering", async () => {
    try {
      const tempUserCredentials = {
        username: "test user",
        email: "testemail@example.com",
        password: "password",
      };
      const registerResponse = await request(app).post("/api/auth/register").send(tempUserCredentials).expect(200);
      const accessToken = registerResponse.headers["set-cookie"]
        .find((cookie) => cookie.startsWith("accessToken="))
        .split(";")[0]
        .split("=")[1];

      const decodedToken = jwt.verify(accessToken, process.env.JWT_USER_ACCESS_TOKEN_SECRET);
      expect(decodedToken).toHaveProperty("userData");
    } catch (error) {
      throw error;
    }
  });
});
