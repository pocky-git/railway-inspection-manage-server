const { User, Tenant, Department } = require("../models");
const bcrypt = require("bcryptjs");
const { ROLE_ID } = require("../constants/role");

/**
 * 添加用户
 */
async function addUser(ctx) {
  try {
    const {
      username,
      password,
      real_name,
      phone,
      email,
      tenant_id,
      department_id,
      role_id,
    } = ctx.request.body;
    const currentUser = ctx.user;

    // 参数验证
    if (!username || !password || !real_name || !phone || !email) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "用户名、密码、真实姓名、手机号和邮箱不能为空",
      };
      return;
    }

    // 权限验证
    let userRoleId = role_id || ROLE_ID.REGULAR_USER;
    let userTenantId = tenant_id;
    let userDepartmentId = department_id;

    // 超级管理员可以添加任意角色的用户
    if (currentUser.role_id === ROLE_ID.SUPER_ADMIN) {
      // 验证租户ID和部门ID是否存在
      if (userRoleId >= 3 && !userTenantId) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: "部门管理员和普通用户必须指定租户ID",
        };
        return;
      }
      if (userRoleId === 4 && !userDepartmentId) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: "普通用户必须指定部门ID",
        };
        return;
      }
    }
    // 租户管理员只能添加部门管理员和普通用户
    else if (currentUser.role_id === 2) {
      if (userRoleId <= 2) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: "租户管理员只能添加部门管理员和普通用户",
        };
        return;
      }
      // 只能为自己的租户添加用户
      userTenantId = currentUser.tenant_id;
      if (userRoleId === 4 && !userDepartmentId) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: "普通用户必须指定部门ID",
        };
        return;
      }
    }
    // 部门管理员只能添加普通用户
    else if (currentUser.role_id === 3) {
      if (userRoleId !== 4) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: "部门管理员只能添加普通用户",
        };
        return;
      }
      // 只能为自己的租户和部门添加用户
      userTenantId = currentUser.tenant_id;
      userDepartmentId = currentUser.department_id;
    }
    // 普通用户没有添加用户的权限
    else {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限添加用户",
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

    // 创建用户
    const user = await User.create({
      username,
      password,
      real_name,
      phone,
      email,
      role_id: userRoleId,
      tenant_id: userTenantId,
      department_id: userDepartmentId,
    });

    // 移除密码字段
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "用户添加成功",
      data: { user: userWithoutPassword },
    };
  } catch (error) {
    console.error("添加用户错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 删除用户
 */
async function deleteUser(ctx) {
  try {
    const { id } = ctx.params;
    const currentUser = ctx.user;

    if (!id) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "用户ID不能为空",
      };
      return;
    }

    // 查找用户
    const user = await User.findById(id);
    if (!user) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: "用户不存在",
      };
      return;
    }

    // 权限验证
    if (currentUser.role_id === ROLE_ID.SUPER_ADMIN) {
      // 超级管理员可以删除任意用户（除了自己）
      if (user.id === currentUser.id) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: "不能删除自己的账号",
        };
        return;
      }
    } else if (currentUser.role_id === ROLE_ID.TENANT_ADMIN) {
      // 租户管理员只能删除自己租户下的用户
      if (user.tenant_id.toString() !== currentUser.tenant_id.toString()) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: "没有权限删除该用户",
        };
        return;
      }
    } else if (currentUser.role_id === ROLE_ID.DEPARTMENT_ADMIN) {
      // 部门管理员只能删除自己部门下的普通用户
      if (
        user.department_id.toString() !==
          currentUser.department_id.toString() ||
        user.role_id !== ROLE_ID.REGULAR_USER
      ) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: "没有权限删除该用户",
        };
        return;
      }
    } else {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限删除用户",
      };
      return;
    }

    // 删除用户
    await User.findByIdAndDelete(id);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "用户删除成功",
    };
  } catch (error) {
    console.error("删除用户错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 查询用户列表
 */
async function getUsers(ctx) {
  try {
    const { tenant_id, department_id, page = 1, pageSize = 10 } = ctx.query;
    const currentUser = ctx.user;
    const skip = (page - 1) * pageSize;

    let query = {};

    // 根据用户角色筛选用户
    if (currentUser.role_id === ROLE_ID.SUPER_ADMIN) {
      // 超级管理员可以查看所有用户，或根据条件筛选
      if (tenant_id) query.tenant_id = tenant_id;
      if (department_id) query.department_id = department_id;
    } else if (currentUser.role_id === ROLE_ID.TENANT_ADMIN) {
      // 租户管理员只能查看自己租户下的用户
      query.tenant_id = currentUser.tenant_id;
      if (department_id) query.department_id = department_id;
    } else if (currentUser.role_id === ROLE_ID.DEPARTMENT_ADMIN) {
      // 部门管理员只能查看自己部门下的用户
      query.department_id = currentUser.department_id;
    } else {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限查看用户列表",
      };
      return;
    }

    const users = await User.find({
      ...query,
      role_id: {
        $nin: [ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT_ADMIN],
      },
    })
      .skip(skip)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 })
      .select("-password");

    // 处理用户数据，补充租户名称和部门名称
    const usersWithNames = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();

        // 获取租户名称
        if (user.tenant_id) {
          const tenant = await Tenant.findById(user.tenant_id);
          if (tenant) {
            userObj.tenant_name = tenant.name;
          }
        }

        // 获取部门名称
        if (user.department_id) {
          const department = await Department.findById(user.department_id);
          if (department) {
            userObj.department_name = department.name;
          }
        }

        return userObj;
      })
    );

    const total = await User.countDocuments(query);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "查询用户列表成功",
      data: {
        list: usersWithNames,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    };
  } catch (error) {
    console.error("查询用户列表错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 根据ID查询用户
 */
async function getUserById(ctx) {
  try {
    const { id } = ctx.params;
    const currentUser = ctx.user;

    if (!id) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "用户ID不能为空",
      };
      return;
    }

    // 查找用户
    const user = await User.findById(id).select("-password");
    if (!user) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: "用户不存在",
      };
      return;
    }

    // 转换为普通对象并添加租户和部门名称
    const userObj = user.toObject();

    // 获取租户名称
    if (user.tenant_id) {
      const tenant = await Tenant.findById(user.tenant_id);
      if (tenant) {
        userObj.tenant_name = tenant.name;
      }
    }

    // 获取部门名称
    if (user.department_id) {
      const department = await Department.findById(user.department_id);
      if (department) {
        userObj.department_name = department.name;
      }
    }

    // 权限验证
    if (currentUser.role_id === ROLE_ID.SUPER_ADMIN) {
      // 超级管理员可以查看任意用户
    } else if (currentUser.role_id === ROLE_ID.TENANT_ADMIN) {
      // 租户管理员只能查看自己租户下的用户
      if (user.tenant_id.toString() !== currentUser.tenant_id.toString()) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: "没有权限查看该用户",
        };
        return;
      }
    } else if (currentUser.role_id === ROLE_ID.DEPARTMENT_ADMIN) {
      // 部门管理员只能查看自己部门下的用户
      if (
        user.department_id.toString() !== currentUser.department_id.toString()
      ) {
        ctx.status = 403;
        ctx.body = {
          code: 403,
          message: "没有权限查看该用户",
        };
        return;
      }
    } else {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限查看用户信息",
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "查询用户成功",
      data: { user: userObj },
    };
  } catch (error) {
    console.error("查询用户错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

module.exports = {
  addUser,
  deleteUser,
  getUsers,
  getUserById,
};
