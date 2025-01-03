const { app, request, db, seed, data } = require("../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
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
});

/////////////////////////////////////////////////////////////////////////// LOGOUT
describe("POST api/auth/logout", () => {
  test("should return a 200 status code, indicating user logout is successful", async () => {
    try {
      const tempUserLoginCredentials = data.users[0];
      const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
      const cookies = loginResponse.headers["set-cookie"];
      await request(app).post("/api/auth/logout").set("Cookie", cookies).expect(200);
    } catch (error) {
      throw error;
    }
  });

  test("should return a 401 status code, indicating the user is not logged in", async () => {
    try {
      await request(app).post("/api/auth/logout").expect(401);
    } catch (error) {
      throw error;
    }
  });
});
