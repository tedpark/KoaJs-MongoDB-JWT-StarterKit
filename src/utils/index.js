// Functions which will be used here and there

/**
 * Authentication middleware for authenticated routes.
 * Use it like:
 * router.get('/authenticated-route', authenticated(), async (ctx, next) {
 *
 * @param object  ctx     Context
 * @param object  next    if authenticated, goes to next
 * @returns
 */
require("dotenv").config();
const jwt = require("jsonwebtoken");

function decodeToken(token) {
  console.log(token);
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_CODE, (error, decoded) => {
      if (error) reject(error);
      resolve(decoded);
    });
  });
}

exports.isAuthenticated = () => {
  return async (ctx, next) => {
    if (ctx.request.header.authorization === undefined) {
      return (ctx.body = {
        status: "fail",
        message: "undefiend header.authorization"
      });
    }
    try {
      const jsonValue = await decodeToken(
        ctx.request.header.authorization.split(" ")[1]
      );
      console.log(jsonValue);
      return next();
    } catch (e) {
      console.log(e);
      return (ctx.body = {
        status: "fail",
        message: "not validate"
      });
    }
  };
};
