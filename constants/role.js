// 角色ID常量定义
const ROLE_ID = {
  SUPER_ADMIN: 1,
  TENANT_ADMIN: 2,
  DEPARTMENT_ADMIN: 3,
  REGULAR_USER: 4,
};

// 角色名称映射
const ROLE_NAME_MAP = {
  [ROLE_ID.SUPER_ADMIN]: "超级管理员",
  [ROLE_ID.TENANT_ADMIN]: "租户管理员",
  [ROLE_ID.DEPARTMENT_ADMIN]: "部门管理员",
  [ROLE_ID.REGULAR_USER]: "普通用户",
};

module.exports = {
  ROLE_ID,
  ROLE_NAME_MAP,
};
