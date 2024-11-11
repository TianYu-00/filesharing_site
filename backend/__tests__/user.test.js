const { app, request, db, seed, data } = require("../testIndex");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("Users Tests", () => {
  test("/api/users should fetch all users", async () => {
    const result = await request(app).get("/api/users");
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.data).toHaveLength(data.users.length);
  });

  test("/api/users/:user_id should fetch a user by ID", async () => {
    const result = await request(app).get("/api/users/1");
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.data).toHaveProperty("username", "elise");
  });

  test("/api/users/register should register a new user", async () => {
    const newUser = {
      username: "newuser",
      email: "newuser@example.com",
      password: "newpassword123",
    };

    const result = await request(app).post("/api/users/register").send(newUser);
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.data).toHaveProperty("username", newUser.username);
  });
});

describe("User Login Tests", () => {
  beforeEach(async () => {
    const newUser = {
      username: "testuser",
      email: "testuser@example.com",
      password: "testpassword123",
    };

    await request(app).post("/api/users/register").send(newUser);
  });

  test("/api/users/login should successfully log in a user", async () => {
    const loginUser = {
      email: "testuser@example.com",
      password: "testpassword123",
    };

    const result = await request(app).post("/api/users/login").send(loginUser);
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.msg).toBe("Login approved");
    expect(result.body.data).toHaveProperty("username");
    expect(result.body.data.username).toBe("testuser");
  });

  test("/api/users/login should return an error for incorrect email", async () => {
    const loginUser = {
      email: "nonexistentuser@example.com",
      password: "somepassword123",
    };

    const result = await request(app).post("/api/users/login").send(loginUser);
    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);
    expect(result.body.msg).toBe("User not found");
  });

  test("/api/users/login should return an error for incorrect password", async () => {
    const loginUser = {
      email: "testuser@example.com",
      password: "wrongpassword123",
    };

    const result = await request(app).post("/api/users/login").send(loginUser);
    expect(result.status).toBe(400);
    expect(result.body.success).toBe(false);
    expect(result.body.msg).toBe("Incorrect password");
  });
});
