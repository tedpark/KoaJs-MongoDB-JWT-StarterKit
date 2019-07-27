const Router = require("koa-router");
const router = new Router();

const auth = require("./authCheck.controller");
const users = require("./users.controller");
const products = require("./products.controller");

router.use("/auth", auth.routes());
router.use("/users", users.routes());
router.use("/products", products.routes());

module.exports = router;
