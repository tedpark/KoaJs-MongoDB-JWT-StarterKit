const Router = require("koa-router");
const router = new Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../utils");

function decodeToken(token) {
  console.log(token);
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_CODE, (error, decoded) => {
      if (error) reject(error);
      resolve(decoded);
    });
  });
}

router.get(
  "/getUserProfileWithToken/",
  isAuthenticated(),
  async (ctx, next) => {
    try {
      const jsonValue = await decodeToken(
        ctx.request.header.authorization.split(" ")[1]
      );
      ctx.body = jsonValue;
      return next();
    } catch (e) {
      console.log(e);
      return (ctx.body = {
        status: "fail",
        message: "not validate"
      });
    }
  }
);

module.exports = router;
