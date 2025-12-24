const Router = require("koa-router");
const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/auth");

const router = new Router({ prefix: "/api/department" });

// 添加部门
router.post("/", authMiddleware, departmentController.addDepartment);

// 删除部门
router.delete("/:id", authMiddleware, departmentController.deleteDepartment);

// 查询部门列表
router.get("/", authMiddleware, departmentController.getDepartments);

// 根据ID查询部门
router.get("/:id", authMiddleware, departmentController.getDepartmentById);

// 更新部门
router.put("/:id", authMiddleware, departmentController.updateDepartment);

module.exports = router;
