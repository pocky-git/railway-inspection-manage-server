const { Tenant, User } = require("../models");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { ROLE_ID } = require("../constants/role");

/**
 * 添加租户
 */
async function addTenant(ctx) {
  try {
    const { name } = ctx.request.body;

    // 参数验证
    if (!name) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户名称不能为空",
      };
      return;
    }

    // 检查租户账号是否已存在
    const existingTenant = await Tenant.findOne({ name });
    if (existingTenant) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户名称已存在",
      };
      return;
    }

    // 创建租户
    const tenant = await Tenant.create({
      name,
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

    // 删除租户下的所有部门
    await User.deleteMany({ department_id: id });

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
    const { page = 1, pageSize = 10, name } = ctx.query;
    const skip = (page - 1) * pageSize;

    const query = {};
    if (name) query.name = { $regex: name, $options: "i" };

    const tenants = await Tenant.find(query)
      .skip(skip)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(query);

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

/**
 * 编辑租户
 */
async function updateTenant(ctx) {
  try {
    const { id } = ctx.params;
    const { name } = ctx.request.body;

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: "租户不存在",
      };
      return;
    }

    // 参数验证
    if (!name) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户名称不能为空",
      };
      return;
    }

    // 检查租户账号是否已存在
    const existingTenant = await Tenant.findOne({ name, _id: { $ne: id } });
    if (existingTenant) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "租户已存在",
      };
      return;
    }

    // 更新租户
    const updatedTenant = await Tenant.findByIdAndUpdate(
      id,
      {
        name,
      },
      { new: true }
    );

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "租户编辑成功",
      data: { tenant: updatedTenant },
    };
  } catch (error) {
    console.error("编辑租户错误:", error);
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
  updateTenant,
};
