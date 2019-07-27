require("dotenv").config();
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");

const router = require("./routes");
const mongoose = require("mongoose");
const PORT = 3000;

// authentication
require("./utils/auth");
const passport = require("koa-passport");

app = new Koa();

mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(response => {
    console.log("Success connected to mongoDB");
  })
  .catch(error => {
    console.log(error);
  });

// sessions
const session = require("koa-session");
app.keys = [process.env.SESSION_SECRET];

app
  .use(session({}, app))
  .use(bodyParser())
  .use(passport.initialize())
  .use(passport.session())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
