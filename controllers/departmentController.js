const { Department, Tenant } = require("../models");
const { ROLE_ID } = require("../constants/role");

/**
 * 添加部门
 */
async function addDepartment(ctx) {
  try {
    const { name, tenant_id } = ctx.request.body;
    const user = ctx.user;

    // 参数验证
    if (!name) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "部门名称不能为空",
      };
      return;
    }

    // 权限验证：只有超级管理员或租户管理员可以添加部门
    if (
      user.role_id !== ROLE_ID.SUPER_ADMIN &&
      user.role_id !== ROLE_ID.TENANT_ADMIN
    ) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限添加部门",
      };
      return;
    }

    // 如果是租户管理员，只能为自己的租户添加部门
    let departmentTenantId = tenant_id;
    if (user.role_id === ROLE_ID.TENANT_ADMIN) {
      departmentTenantId = user.tenant_id;
    }

    // 创建部门
    const department = await Department.create({
      name,
      tenant_id: departmentTenantId,
    });

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "部门添加成功",
      data: { department },
    };
  } catch (error) {
    console.error("添加部门错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 删除部门
 */
async function deleteDepartment(ctx) {
  try {
    const { id } = ctx.params;
    const user = ctx.user;

    if (!id) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "部门ID不能为空",
      };
      return;
    }

    // 查找部门
    const department = await Department.findById(id);
    if (!department) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: "部门不存在",
      };
      return;
    }

    // 权限验证：只有超级管理员或该租户的管理员可以删除部门
    if (
      user.role_id !== ROLE_ID.SUPER_ADMIN &&
      (user.role_id !== ROLE_ID.TENANT_ADMIN ||
        user.tenant_id.toString() !== department.tenant_id.toString())
    ) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限删除该部门",
      };
      return;
    }

    // 删除部门
    await Department.findByIdAndDelete(id);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "部门删除成功",
    };
  } catch (error) {
    console.error("删除部门错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 查询部门列表
 */
async function getDepartments(ctx) {
  try {
    const { tenant_id, page = 1, pageSize = 10, name } = ctx.query;
    const user = ctx.user;
    const skip = (page - 1) * pageSize;

    let query = {};

    // 根据用户角色筛选部门
    if (user.role_id === ROLE_ID.SUPER_ADMIN) {
      // 超级管理员可以查看所有部门，或指定租户的部门
      if (tenant_id) {
        query.tenant_id = tenant_id;
      }
    } else if (
      user.role_id === ROLE_ID.TENANT_ADMIN ||
      user.role_id === ROLE_ID.DEPARTMENT_ADMIN
    ) {
      // 租户管理员和部门管理员只能查看自己租户的部门
      query.tenant_id = user.tenant_id;
    } else {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限查看部门列表",
      };
      return;
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    const departments = await Department.find(query)
      .skip(skip)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 });

    const departmentsWithNames = await Promise.all(
      departments.map(async (department) => {
        const departmentObj = department.toObject();

        // 获取租户名称
        if (department.tenant_id) {
          const tenant = await Tenant.findById(department.tenant_id);
          if (tenant) {
            departmentObj.tenant_name = tenant.name;
          }
        }

        return departmentObj;
      })
    );

    const total = await Department.countDocuments(query);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "查询部门列表成功",
      data: {
        list: departmentsWithNames,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    };
  } catch (error) {
    console.error("查询部门列表错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

/**
 * 根据ID查询部门
 */
async function getDepartmentById(ctx) {
  try {
    const { id } = ctx.params;
    const user = ctx.user;

    if (!id) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: "部门ID不能为空",
      };
      return;
    }

    // 查找部门
    const department = await Department.findById(id);
    if (!department) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: "部门不存在",
      };
      return;
    }

    // 权限验证：只有超级管理员或该租户的管理员可以查看部门详情
    if (
      user.role_id !== ROLE_ID.SUPER_ADMIN &&
      (user.role_id !== ROLE_ID.TENANT_ADMIN ||
        user.tenant_id.toString() !== department.tenant_id.toString())
    ) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: "没有权限查看该部门",
      };
      return;
    }

    // 转换为普通对象并添加租户名称
    const departmentObj = department.toObject();

    // 获取租户名称
    if (department.tenant_id) {
      const tenant = await Tenant.findById(department.tenant_id);
      if (tenant) {
        departmentObj.tenant_name = tenant.name;
      }
    }

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "查询部门成功",
      data: { department: departmentObj },
    };
  } catch (error) {
    console.error("查询部门错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

module.exports = {
  addDepartment,
  deleteDepartment,
  getDepartments,
  getDepartmentById,
};
