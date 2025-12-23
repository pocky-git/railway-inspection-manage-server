const { Schema, model } = require("mongoose");

// 租户模型Schema
const TenantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      comment: "租户名称",
    },
    email: {
      type: String,
      required: true,
      comment: "租户邮箱",
    },
    phone: {
      type: String,
      required: true,
      comment: "租户手机号",
    },
    username: {
      type: String,
      required: true,
      unique: true,
      comment: "租户账号",
    },
    password: {
      type: String,
      required: true,
      comment: "租户密码",
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
      comment: "状态：true-启用，false-禁用",
    },
  },
  {
    timestamps: true,
    collection: "tenants",
  }
);

const Tenant = model("Tenant", TenantSchema);

module.exports = Tenant;
