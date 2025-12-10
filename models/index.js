const User = require('./User');
const Permission = require('./Permission');

// 模型不需要显式同步，Mongoose会自动创建集合

module.exports = {
  User,
  Permission
};
