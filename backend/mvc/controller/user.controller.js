const { getAllUsers, getUser, postUser, attemptLogin } = require("../models/user.model");

exports.fetchAllUsers = async (req, res, next) => {
  try {
    const data = await getAllUsers();
    res.json({ success: true, msg: "Users has been fetched", data: data });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};

exports.fetchUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;
    const data = await getUser(user_id);
    res.json({ success: true, msg: "User has been fetched", data: data });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};

exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const data = await postUser({ username, email, password });
    res.json({ success: true, msg: "User has been created", data: data });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await attemptLogin({ email, password });
    res.json({ success: true, msg: "Login approved", data: data });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.message, data: null });
  }
};
