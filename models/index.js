const User = require("./User");
const Tenant = require("./Tenant");
const Department = require("./Department");

// 模型不需要显式同步，Mongoose会自动创建集合

module.exports = {
  User,
  Tenant,
  Department,
};
