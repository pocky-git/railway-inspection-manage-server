const { Schema, model } = require("mongoose");

// 部门模型Schema
const DepartmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      comment: "部门名称",
    },
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      comment: "所属租户ID",
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
    collection: "departments",
  }
);

const Department = model("Department", DepartmentSchema);

module.exports = Department;
