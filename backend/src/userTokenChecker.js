const jwt = require("jsonwebtoken");
const { createAccessToken, createCookie, compareBlackListedToken } = require("../mvc/models/auth.model");
const { getUser } = require("../mvc/models/user.model");

const userTokenChecker = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_USER_ACCESS_TOKEN_SECRET);
    await compareBlackListedToken(decodedAccessToken);
    req.userData = decodedAccessToken.userData;
    return next();
  } catch (err) {
    try {
      const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_USER_REFRESH_TOKEN_SECRET);
      await compareBlackListedToken(decodedRefreshToken);

      const userId = decodedRefreshToken.userId;

      if (!userId) {
        return res.status(401).json({ success: false, msg: "Refresh token is invalid (missing userId)" });
      }

      const userData = await getUser(userId);

      const newAccessToken = await createAccessToken(userData);
      await createCookie({
        res,
        cookieValue: newAccessToken,
        cookieName: "accessToken",
        cookieMaxAgeInSeconds: 900,
      });

      const decodedNewAccessToken = jwt.decode(newAccessToken);
      req.userData = decodedNewAccessToken.userData;
      return next();
    } catch (err) {
      return next({
        code: "NOT_LOGGED_IN",
        message: "User session expired",
      });
    }
  }
};

module.exports = userTokenChecker;

/*

Thought process:

- get access token from cookie 
- get refresh token from cookie
- check to see if they are exist
- error if any tokens are missing

- verify access token to see if its valid
- if its valid go next
- else
- check refresh token to see if its valid
- if its valid fetch user data from database with userId (from refresh token)
- create the new access token
- create the cookie for it
- go next
- else
- respond back to reject

*/
