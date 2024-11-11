const db = require("../../db/connection");
const bcrypt = require("bcrypt");

exports.getAllUsers = async () => {
  try {
    const result = await db.query(`SELECT * FROM users;`);
    return result.rows;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getUser = async (user_id) => {
  try {
    const result = await db.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
    if (result.rows.length === 0) {
      throw new Error("user not found");
    }
    return result.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.postUser = async ({ username, email, password }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
      [username, email, hashedPassword]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.attemptLogin = async ({ email, password }) => {
  try {
    const fetchedUserByEmail = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (fetchedUserByEmail.rows.length === 0) {
      throw new Error("User not found");
    }
    const user = fetchedUserByEmail.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Incorrect password");
    }
    const { password: _, ...userDataWithoutPassword } = user;
    return userDataWithoutPassword;
  } catch (err) {
    throw new Error(err.message);
  }
};
