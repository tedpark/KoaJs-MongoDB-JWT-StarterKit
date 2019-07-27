const dataModel = require("../models/product.model");
const Router = require("koa-router");
const { isAuthenticated } = require("../utils");
const router = new Router();

router.get("/", async (ctx, next) => {
  const model = await dataModel.find({});
  ctx.body = model;
});

router.get("/:id", async (ctx, next) => {
  // Fetch one Todo’s from the database and return as payload
  const id = ctx.params.id;
  const model = await dataModel.findById(id);
  ctx.body = model;
});

router.get("/findByTitle/:id", async (ctx, next) => {
  const id = ctx.params.id;
  const model = await dataModel.find({
    title: { $regex: id, $options: "i" }
  });
  ctx.body = model;
});

// #Example
// router.get("/findBySomething/:id", async (ctx, next) => {
//   const id = ctx.params.id;
//   const model = await dataModel.find({ something: id });
//   ctx.body = model;
// });

router.post("/", isAuthenticated(), async (ctx, next) => {
  // Create New Todo from payload sent and save to database
  const newTodo = new dataModel(ctx.request.body);
  const savedTodo = await newTodo.save();
  ctx.body = savedTodo;
});

router.delete("/:id", isAuthenticated(), async (ctx, next) => {
  // Get id from url parameters and find Todo in database
  const id = ctx.params.id;
  const model = await dataModel.findById(id);

  // Delete todo from database and return deleted object as reference
  const deletedTodo = await dataModel.remove();
  ctx.body = deletedTodo;
});

router.put("/:id", isAuthenticated(), async (ctx, next) => {
  // Find Todo based on id, then toggle done on/off
  const id = ctx.params.id;
  const todo = await dataModel.findById(id);
  todo.done = !todo.done;

  // Update todo in database
  const updatedTodo = await todo.save();
  ctx.body = updatedTodo;
});

module.exports = router;
