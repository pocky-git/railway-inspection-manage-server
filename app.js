const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const authRouter = require("./routes/auth");
const { connectDB } = require("./config/db"); // 初始化数据库连接
connectDB();

// 创建Koa应用
const app = new Koa();

// 注册中间件
app.use(bodyParser());

// 注册路由
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("请求错误:", error);
    ctx.status = error.status || 500;
    ctx.body = {
      code: error.status || 500,
      message: error.message || "服务器内部错误",
    };
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动，监听端口 ${PORT}`);
});
