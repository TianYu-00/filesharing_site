const jwt = require("jsonwebtoken");
const { createAccessToken, createCookie, compareBlackListedToken } = require("../mvc/models/auth.model");
const { getUser } = require("../mvc/models/user.model");

const userTokenChecker = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  try {
    const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_USER_ACCESS_TOKEN_SECRET);
    await compareBlackListedToken(decodedAccessToken);
    req.userData = decodedAccessToken.userData;
  } catch (accessErr) {
    if (!refreshToken) return next();

    try {
      const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_USER_REFRESH_TOKEN_SECRET);
      await compareBlackListedToken(decodedRefreshToken);

      const userId = decodedRefreshToken.userId;

      if (!userId) return next();

      const userData = await getUser(userId);

      const { password, ...sanitizedUserData } = userData;

      const newAccessToken = await createAccessToken(sanitizedUserData);
      await createCookie({
        res,
        cookieValue: newAccessToken,
        cookieName: "accessToken",
        cookieMaxAgeInSeconds: 900,
      });

      const decodedNewAccessToken = jwt.decode(newAccessToken);
      req.userData = decodedNewAccessToken.userData;
    } catch (refreshErr) {
      return next();
    }
  }

  // console.log(req.userData);

  return next();
};

module.exports = userTokenChecker;
