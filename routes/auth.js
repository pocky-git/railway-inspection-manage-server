const Router = require("koa-router");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = new Router({ prefix: "/api/auth" });

// 登录接口
router.post("/login", authController.login);

// 获取当前用户信息
router.get("/current", authMiddleware, authController.getCurrentUser);

// 创建超级管理员接口
router.post("/create-super-admin", authController.createSuperAdmin);

module.exports = router;
