const { User } = require("../models");
const { generateToken } = require("../utils/jwt");
const { ROLE_ID } = require("../constants/role");

/**
 * 登录接口
 */
async function login(ctx) {
  try {
    const { username, password } = ctx.request.body;

    // 参数验证
    if (!username || !password) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "用户名和密码不能为空",
      };
      return;
    }

    // 查询用户
    const user = await User.findOne({ username });

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "用户名或密码错误",
      };
      return;
    }

    // 检查用户状态
    if (!user.status) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "用户已被禁用",
      };
      return;
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "用户名或密码错误",
      };
      return;
    }

    // 生成token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
    });

    // 返回登录成功信息
    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "登录成功",
      data: {
        user: {
          id: user.id,
          username: user.username,
          real_name: user.real_name,
          phone: user.phone,
          email: user.email,
          role_id: user.role_id,
          status: user.status,
        },
        token,
      },
    };
  } catch (error) {
    console.error("登录错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 获取当前用户信息
 */
async function getCurrentUser(ctx) {
  try {
    const user = ctx.user;

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "获取用户信息成功",
      data: {
        user,
      },
    };
  } catch (error) {
    console.error("获取用户信息错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 创建超级管理员账号
 * 该接口用于初始化系统时创建超级管理员
 */
async function createSuperAdmin(ctx) {
  try {
    const { username, password, real_name, phone, email } = ctx.request.body;

    // 参数验证
    if (!username || !password || !real_name || !phone || !email) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "用户名、密码、真实姓名、手机号和邮箱不能为空",
      };
      return;
    }

    // 检查是否已经存在超级管理员
    const existingSuperAdmin = await User.findOne({
      role_id: ROLE_ID.SUPER_ADMIN,
    });
    if (existingSuperAdmin) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "超级管理员账号已存在",
      };
      return;
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "用户名已存在",
      };
      return;
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "邮箱已存在",
      };
      return;
    }

    // 创建超级管理员
    const superAdmin = await User.create({
      username,
      password,
      real_name,
      phone,
      email,
      role_id: ROLE_ID.SUPER_ADMIN,
      // 超级管理员不需要租户和部门
      tenant_id: null,
      department_id: null,
    });

    // 移除密码字段
    const superAdminWithoutPassword = superAdmin.toObject();
    delete superAdminWithoutPassword.password;

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "超级管理员账号创建成功",
      data: { user: superAdminWithoutPassword },
    };
  } catch (error) {
    console.error("创建超级管理员错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

module.exports = {
  login,
  getCurrentUser,
  createSuperAdmin,
};
