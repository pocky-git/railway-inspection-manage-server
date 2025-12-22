const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

// 用户模型Schema
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      comment: "用户名",
    },
    password: {
      type: String,
      required: true,
      comment: "密码",
    },
    real_name: {
      type: String,
      required: true,
      comment: "真实姓名",
    },
    phone: {
      type: String,
      required: true,
      comment: "手机号",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      comment: "邮箱",
    },
    role_id: {
      type: Number,
      required: true,
      default: 4,
      comment: "角色ID，1-超级管理员，2-租户管理员，3-部门管理员，4-普通用户",
    },
    tenant_id: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: false,
      comment: "所属租户ID（普通用户和部门管理员必填）",
    },
    department_id: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: false,
      comment: "所属部门ID（普通用户必填）",
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
    collection: "users",
  }
);

// 密码加密中间件
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 密码比较方法
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model("User", UserSchema);

module.exports = User;
