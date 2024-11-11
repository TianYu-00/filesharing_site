const { getAllUsers, getUser, postUser, attemptLogin, updateUser } = require("../models/user.model");

exports.fetchAllUsers = async (req, res, next) => {
  try {
    const data = await getAllUsers();
    res.json({ success: true, msg: "Users has been fetched", data: data });
  } catch (err) {
    next(err);
  }
};

exports.fetchUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const data = await getUser(user_id);
    res.json({ success: true, msg: "User has been fetched", data: data });
  } catch (err) {
    next(err);
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const data = await postUser({ username, email, password });
    res.json({ success: true, msg: "User has been created", data: data });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await attemptLogin({ email, password });
    res.json({ success: true, msg: "Login approved", data: data });
  } catch (err) {
    next(err);
  }
};

exports.editUserById = async (req, res, next) => {
  try {
    console.log("1");
    const user_id = req.params.user_id;
    const body = req.body;
    console.log(user_id, body);
    const data = await updateUser(user_id, body);
    res.json({ success: true, msg: "User has been updated", data: data });
  } catch (err) {
    next(err);
  }
};
