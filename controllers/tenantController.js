const { Tenant, User } = require("../models");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { ROLE_ID } = require("../constants/role");

/**
 * 添加租户
 */
async function addTenant(ctx) {
  try {
    const { name, email, phone, username, password } = ctx.request.body;

    // 参数验证
    if (!name || !email || !phone || !username || !password) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户名称、邮箱、手机号、账号和密码不能为空",
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

    // 检查租户账号是否已存在
    const existingTenant = await Tenant.findOne({ username });
    if (existingTenant) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户账号已存在",
      };
      return;
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建租户
    const tenant = await Tenant.create({
      name,
      email,
      phone,
      username,
      password: hashedPassword,
    });

    // 创建租户管理员用户
    const tenantAdmin = await User.create({
      username: tenant.username,
      password,
      real_name: tenant.name,
      phone: tenant.phone,
      email: tenant.email,
      role_id: ROLE_ID.TENANT_ADMIN, // 租户管理员
      tenant_id: tenant._id,
    });

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "租户添加成功",
      data: { tenant },
    };
  } catch (error) {
    console.error("添加租户错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 删除租户
 */
async function deleteTenant(ctx) {
  try {
    const { id } = ctx.params;

    if (!id) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户ID不能为空",
      };
      return;
    }

    // 删除租户
    const result = await Tenant.findByIdAndDelete(id);

    if (!result) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: "租户不存在",
      };
      return;
    }

    // 删除租户下的所有用户
    await User.deleteMany({ tenant_id: id });

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "租户删除成功",
    };
  } catch (error) {
    console.error("删除租户错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 查询租户列表
 */
async function getTenants(ctx) {
  try {
    const { page = 1, pageSize = 10 } = ctx.query;
    const skip = (page - 1) * pageSize;

    const tenants = await Tenant.find({})
      .skip(skip)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments({});

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "查询租户列表成功",
      data: {
        list: tenants,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    };
  } catch (error) {
    console.error("查询租户列表错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 根据ID查询租户
 */
async function getTenantById(ctx) {
  try {
    const { id } = ctx.params;

    if (!id) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户ID不能为空",
      };
      return;
    }

    const tenant = await Tenant.findById(id);

    if (!tenant) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: "租户不存在",
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "查询租户成功",
      data: { tenant },
    };
  } catch (error) {
    console.error("查询租户错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

module.exports = {
  addTenant,
  deleteTenant,
  getTenants,
  getTenantById,
};
