const Router = require("koa-router");
const tenantController = require("../controllers/tenantController");
const authMiddleware = require("../middleware/auth");
const { ROLE_ID } = require("../constants/role");

const router = new Router({ prefix: "/api/tenant" });

// 添加租户（只有超级管理员可以添加）
router.post("/", authMiddleware, async (ctx) => {
  const user = ctx.user;
  if (user.role_id !== ROLE_ID.SUPER_ADMIN) {
    ctx.status = 403;
    ctx.body = {
      code: 403,
      message: "只有超级管理员可以添加租户",
    };
    return;
  }
  await tenantController.addTenant(ctx);
});

// 删除租户（只有超级管理员可以删除）
router.delete("/:id", authMiddleware, async (ctx) => {
  const user = ctx.user;
  if (user.role_id !== ROLE_ID.SUPER_ADMIN) {
    ctx.status = 403;
    ctx.body = {
      code: 403,
      message: "只有超级管理员可以删除租户",
    };
    return;
  }
  await tenantController.deleteTenant(ctx);
});

// 查询租户列表（只有超级管理员可以查看所有租户）
router.get("/", authMiddleware, async (ctx) => {
  const user = ctx.user;
  if (user.role_id !== ROLE_ID.SUPER_ADMIN) {
    ctx.status = 403;
    ctx.body = {
      code: 403,
      message: "只有超级管理员可以查看所有租户",
    };
    return;
  }
  await tenantController.getTenants(ctx);
});

// 根据ID查询租户（只有超级管理员可以查看）
router.get("/:id", authMiddleware, async (ctx) => {
  const user = ctx.user;
  if (user.role_id !== ROLE_ID.SUPER_ADMIN) {
    ctx.status = 403;
    ctx.body = {
      code: 403,
      message: "只有超级管理员可以查看租户详情",
    };
    return;
  }
  await tenantController.getTenantById(ctx);
});

module.exports = router;
