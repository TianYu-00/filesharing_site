const { app, request, db, seed, data } = require("../../testIndex");
afterAll(() => {
  return db.end();
});

beforeEach(async () => {
  await seed(data);
});

/////////////////////////////////////////////////////////////////////////// EDIT USER BY ID
describe("PATCH /api/users/:user_id", () => {
  test("should return a 403 status code, indicating a user cannot edit another user's data", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    await request(app).patch("/api/users/2").set("Cookie", cookies).expect(403);
  });

  test("should return a 200 status code, indicating a user successfully updates their own username", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const updatedUser = {
      username: "new_username",
    };
    const { body } = await request(app).patch("/api/users/1").send(updatedUser).set("Cookie", cookies).expect(200);
    expect(body.data).toMatchObject({
      username: "new_username",
    });
  });

  test("should return a 401 status code, indicating the user cannot update their email without entering the current password", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const updatedUser = {
      email: "testemail123@example.com",
    };
    const { body } = await request(app).patch("/api/users/1").send(updatedUser).set("Cookie", cookies).expect(401);
    expect(body.success).toBe(false);
  });

  test("should return a 200 status code, indicating a user successfully updates their email with the correct current password", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const updatedUser = {
      email: "testemail123@example.com",
      currentPassword: tempUserLoginCredentials.password,
    };
    const { body } = await request(app).patch("/api/users/1").send(updatedUser).set("Cookie", cookies).expect(200);
    expect(body.data).toMatchObject({
      email: "testemail123@example.com",
    });
  });

  test("should return a 200 status code, indicating a user successfully updates their password with the correct current password", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const updatedUser = {
      currentPassword: tempUserLoginCredentials.password,
      newPassword: "newpassword123",
    };
    const { body } = await request(app).patch("/api/users/1").send(updatedUser).set("Cookie", cookies).expect(200);
    expect(body.success).toBe(true);
  });

  test("should return a 401 status code, indicating the user cannot update their email with an incorrect current password", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const updatedUser = {
      email: "testemail123@example.com",
      newPassword: "newpassword123",
    };
    const { body } = await request(app).patch("/api/users/1").send(updatedUser).set("Cookie", cookies).expect(401);
    expect(body.success).toBe(false);
  });

  test("should return a 401 status code, indicating the user cannot update their password with an incorrect current password", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const updatedUser = {
      currentPassword: "incorrectpassword",
      newPassword: "newpassword123",
    };
    const { body } = await request(app).patch("/api/users/1").send(updatedUser).set("Cookie", cookies).expect(401);
    expect(body.success).toBe(false);
  });

  test("should return a 200 status code, indicating the user successfully updates their password and receives new tokens", async () => {
    const tempUserLoginCredentials = data.users[0];
    const loginResponse = await request(app).post("/api/auth/login").send(tempUserLoginCredentials).expect(200);
    const cookies = loginResponse.headers["set-cookie"];
    const oldAccessToken = cookies.find((cookie) => cookie.startsWith("accessToken")).split("=")[1];
    const oldRefreshToken = cookies.find((cookie) => cookie.startsWith("refreshToken")).split("=")[1];
    const updatedUser = {
      currentPassword: tempUserLoginCredentials.password,
      newPassword: "newpassword123",
    };
    const editUserResponse = await request(app)
      .patch("/api/users/1")
      .send(updatedUser)
      .set("Cookie", cookies)
      .expect(200);
    expect(editUserResponse.body.success).toBe(true);
    const newCookies = editUserResponse.headers["set-cookie"];
    const newAccessToken = newCookies
      .find((cookie) => cookie.startsWith("accessToken") && !cookie.includes("Expires=Thu, 01 Jan 1970"))
      .split("=")[1];
    const newRefreshToken = newCookies
      .find((cookie) => cookie.startsWith("refreshToken") && !cookie.includes("Expires=Thu, 01 Jan 1970"))
      .split("=")[1];

    expect(newAccessToken).not.toBe(oldAccessToken);
    expect(newRefreshToken).not.toBe(oldRefreshToken);
  });
});
