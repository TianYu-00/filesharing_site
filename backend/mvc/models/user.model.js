const db = require("../../db/connection");
const bcrypt = require("bcrypt");

exports.getAllUsers = async () => {
  try {
    const result = await db.query(`SELECT * FROM users;`);
    return result.rows;
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.getUser = async (user_id) => {
  try {
    const result = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
    if (result.rows.length === 0) {
      return Promise.reject({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    return result.rows[0];
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.postUser = async ({ username, email, password }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at, role;
        `,
      [username, email, hashedPassword]
    );

    return result.rows[0];
  } catch (err) {
    if (err.code === "23505" && err.constraint === "users_email_key") {
      return Promise.reject({ code: "DUPLICATE_EMAIL", message: "Email address already in use" });
    }
    return Promise.reject(err);
  }
};

exports.attemptLogin = async ({ email, password }) => {
  try {
    const fetchedUserByEmail = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (fetchedUserByEmail.rows.length === 0) {
      return Promise.reject({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    const user = fetchedUserByEmail.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return Promise.reject({ code: "INCORRECT_PASSWORD", message: "Incorrect password" });
    }
    const { password: _, ...userDataWithoutPassword } = user;
    return userDataWithoutPassword;
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.updateUser = async (user_id, { username, email, currentPassword, newPassword }) => {
  try {
    const userResult = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
    const user = userResult.rows[0];

    if (!user) {
      return Promise.reject({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const updatedUsername = username || user.username;
    let updatedEmail = user.email;
    let updatedPassword = user.password;

    if (email || newPassword) {
      if (!currentPassword) {
        return Promise.reject({
          code: "PASSWORD_REQUIRED",
          message: "Current password is required to update email or password",
        });
      }

      const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordMatch) {
        return Promise.reject({ code: "INCORRECT_PASSWORD", message: "Incorrect password" });
      }

      if (email) {
        updatedEmail = email;
      }

      if (newPassword) {
        updatedPassword = await bcrypt.hash(newPassword, 10);
      }
    }

    const query = `
      UPDATE users
      SET username = $1, email = $2, password = $3
      WHERE id = $4
      RETURNING id, username, email, created_at, role;
    `;
    const values = [updatedUsername, updatedEmail, updatedPassword, user_id];
    const result = await db.query(query, values);

    return result.rows[0];
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.getUserByEmail = async (userEmail) => {
  try {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [userEmail]);
    if (result.rows.length === 0) {
      return Promise.reject({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    return result.rows[0];
  } catch (err) {
    return Promise.reject(err);
  }
};

exports.patchUserPasswordByEmail = async (userEmail, userNewPassword) => {
  try {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [userEmail]);
    const user = result.rows[0];
    if (!user) {
      return Promise.reject({ code: "USER_NOT_FOUND", message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(userNewPassword, 10);

    const query = `
      UPDATE users
      SET password = $1
      WHERE email = $2
      RETURNING id, username, email, created_at, role;
    `;
    const values = [hashedPassword, userEmail];
    const endResult = await db.query(query, values);

    return endResult.rows[0];
  } catch (err) {
    return Promise.reject({ code: "DB_ERROR", message: err.message });
  }
};

exports.getAllFilesBelongToUserById = async (user_id) => {
  try {
    const query = `
    SELECT * FROM file_info
    WHERE user_id = $1
    `;

    const result = await db.query(query, [user_id]);
    return result.rows;
  } catch (err) {
    return Promise.reject(err);
  }
};
