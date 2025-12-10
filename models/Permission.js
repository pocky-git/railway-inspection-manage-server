const { Schema, model } = require("mongoose");

// 权限模型Schema
const PermissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      comment: "权限名称",
    },
    path: {
      type: String,
      required: false,
      comment: "权限路径",
    },
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
      default: null,
      comment: "父权限ID，根权限为null",
    },
    level: {
      type: Number,
      required: true,
      default: 1,
      comment: "权限层级",
    },
    type: {
      type: String,
      enum: ["menu", "button"],
      required: true,
      default: "menu",
      comment: "权限类型：menu-菜单，button-按钮",
    },
    order: {
      type: Number,
      required: false,
      default: 0,
      comment: "排序",
    },
  },
  {
    timestamps: true,
    collection: "permissions",
  }
);

// 获取树形权限列表
PermissionSchema.statics.getTree = async function () {
  const permissions = await this.find().sort({ level: 1, order: 1 });

  // 构建树形结构
  const tree = [];
  const map = {};

  // 先将所有权限存入map
  permissions.forEach((permission) => {
    const permissionObj = permission.toObject();
    map[permissionObj._id] = permissionObj;
    map[permissionObj._id].children = [];
  });

  // 构建树形结构
  permissions.forEach((permission) => {
    const permissionObj = permission.toObject();
    if (!permissionObj.parent_id) {
      tree.push(map[permissionObj._id]);
    } else if (map[permissionObj.parent_id]) {
      map[permissionObj.parent_id].children.push(map[permissionObj._id]);
    }
  });

  return tree;
};

// 检查权限是否存在
PermissionSchema.statics.checkPermission = async function (
  userId,
  permissionPath
) {
  // 这里需要根据用户角色获取所有权限
  // 暂时简化实现，后续会完善
  return true;
};

const Permission = model("Permission", PermissionSchema);

module.exports = Permission;
