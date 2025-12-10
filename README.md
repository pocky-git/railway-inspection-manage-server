# 铁路巡检系统后台管理服务

## 项目介绍

基于 Koa.js 开发的铁路巡检系统后台管理服务，提供用户登录、权限管理等功能。

## 技术栈

- Koa.js - Web 框架
- Sequelize - ORM 框架
- MySQL - 数据库
- JSON Web Token - 身份认证
- bcryptjs - 密码加密

## 项目结构

```
railway-inspection-system-server/
├── app.js                 # 应用入口文件
├── config/                # 配置文件目录
│   └── db.js             # 数据库配置
├── controllers/           # 控制器目录
│   └── authController.js # 认证相关控制器
├── middleware/            # 中间件目录
│   └── auth.js           # 权限验证中间件
├── models/                # 模型目录
│   ├── User.js           # 用户模型
│   ├── Permission.js     # 权限模型
│   └── index.js          # 模型索引
├── routes/                # 路由目录
│   └── auth.js           # 认证相关路由
├── utils/                 # 工具函数目录
│   └── jwt.js            # JWT工具函数
└── package.json          # 项目依赖
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

修改 `config/db.js` 文件中的数据库配置：

```javascript
const sequelize = new Sequelize({
  database: "railway_inspection", // 数据库名称
  username: "root", // 数据库用户名
  password: "password", // 数据库密码
  host: "localhost", // 数据库地址
  dialect: "mysql", // 数据库类型
  logging: false,
});
```

### 3. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE railway_inspection;
```

### 4. 启动服务器

```bash
npm run start
```

服务器将在 http://localhost:3000 启动

## API 接口

### 登录接口

**请求地址：** POST /api/auth/login

**请求参数：**

```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应：**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "real_name": "管理员",
      "phone": "13800138000",
      "email": "admin@example.com",
      "role_id": 1,
      "status": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "permissions": [
      {
        "id": 1,
        "name": "首页",
        "path": "/dashboard",
        "parent_id": null,
        "level": 1,
        "type": "menu",
        "children": []
      }
      // 更多权限...
    ]
  }
}
```

### 获取当前用户信息

**请求地址：** GET /api/auth/current

**请求头：**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应：**

```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "real_name": "管理员",
      "phone": "13800138000",
      "email": "admin@example.com",
      "role_id": 1,
      "status": true
    },
    "permissions": [
      // 权限树...
    ]
  }
}
```

## 权限说明

系统采用树形权限结构，上一层用户拥有下一层用户的所有权限。

- 权限类型：菜单(menu)和按钮(button)
- 权限层级：通过 parent_id 和 level 字段控制
- 权限继承：上级权限自动拥有下级权限

## 开发说明

### 添加新路由

在 `routes/` 目录下创建新的路由文件，然后在 `app.js` 中注册路由。

### 添加新模型

在 `models/` 目录下创建新的模型文件，然后在 `models/index.js` 中导出。

### 添加新控制器

在 `controllers/` 目录下创建新的控制器文件，实现业务逻辑。

## 注意事项

1. 请确保 MySQL 服务已启动
2. 首次运行会自动创建数据库表结构
3. 请根据实际环境修改数据库配置
4. 建议在生产环境中修改 JWT 密钥
