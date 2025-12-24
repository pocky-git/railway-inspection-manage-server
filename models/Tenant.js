const { Schema, model } = require("mongoose");

// 租户模型Schema
const TenantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      comment: "租户名称",
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
