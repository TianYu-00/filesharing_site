const { selectApis } = require("../models/api.model");

exports.getApis = (req, res, next) => {
  selectApis()
    .then((result) => {
      res.status(200).send({ success: true, msg: "Here are the API endpoints!", data: result });
    })
    .catch(next);
};
