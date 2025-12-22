const Router = require('koa-router');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = new Router({ prefix: '/api/user' });

// 添加用户
router.post('/', authMiddleware, userController.addUser);

// 删除用户
router.delete('/:id', authMiddleware, userController.deleteUser);

// 查询用户列表
router.get('/', authMiddleware, userController.getUsers);

// 根据ID查询用户
router.get('/:id', authMiddleware, userController.getUserById);

module.exports = router;
