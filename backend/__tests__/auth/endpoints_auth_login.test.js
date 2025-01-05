const { app, request, db, seed, data } = require("../../testIndex");
const jwt = require("jsonwebtoken");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// LOGIN
describe("POST api/auth/login", () => {
  test("should return a 400 status code, indicating the user credentials is missing (email)", async () => {
    try {
      const tempUserLoginCredentials = {
        password: "wrong_password",
      };
      await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 400 status code, indicating the user credentials is missing (password)", async () => {
    try {
      const tempUserLoginCredentials = {
        email: "testemail@example.com",
      };
      await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(400);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 401 status code, indicating the user credentials is incorrect", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      tempUserLoginCredentials.password = "wrong_password";
      await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(401);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 200 status code, indicating user login is successful", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return the correct user details", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const { body } = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const { password, ...expected } = data.users[0];
      expect(body.data).toEqual(expect.objectContaining(expected));
    } catch (error) {
      throw error;
    }
  });

  test("should have cookies after logging in", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      expect(cookies).toBeDefined();
    } catch (error) {
      throw error;
    }
  });

  test("should have valid refresh token cookie after logging in", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const refreshToken = loginResponse.headers["set-cookie"]
        .find((cookie) => cookie.startsWith("refreshToken="))
        .split(";")[0]
        .split("=")[1];

      const decodedToken = jwt.verify(refreshToken, process.env.JWT_USER_REFRESH_TOKEN_SECRET);
      expect(decodedToken).toHaveProperty("userId");
    } catch (error) {
      throw error;
    }
  });

  test("should have valid access token cookie after logging in", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const accessToken = loginResponse.headers["set-cookie"]
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
