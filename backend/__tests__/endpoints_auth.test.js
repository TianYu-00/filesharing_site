const { app, request, db, seed, data } = require("../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("GET api/auth/register", () => {
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
});
