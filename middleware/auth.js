const { verifyToken } = require("../utils/jwt");
const { User } = require("../models");

/**
 * 权限验证中间件
 */
async function authMiddleware(ctx, next) {
  try {
    // 获取Authorization头
    const authHeader = ctx.headers.authorization;
    if (!authHeader) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "未提供token",
      };
      return;
    }

    // 提取token
    const token = authHeader.split(" ")[1];
    if (!token) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "token格式错误",
      };
      return;
    }

    // 验证token
    const decoded = verifyToken(token);
    if (!decoded) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "token无效或已过期",
      };
      return;
    }

    // 查询用户信息
    const user = await User.findById(decoded.id, {
      password: 0,
    });

    if (!user || !user.status) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "用户不存在或已被禁用",
      };
      return;
    }

    // 将用户信息存入ctx
    ctx.user = user;
    await next();
  } catch (error) {
    console.error("权限验证错误:", error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "服务器内部错误",
    };
  }
}

module.exports = authMiddleware;
