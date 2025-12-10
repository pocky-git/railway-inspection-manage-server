const mongoose = require('mongoose');

// MongoDB连接地址
const MONGODB_URL = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.10';

// 连接数据库
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URL, {
      dbName: 'railway_inspection',
    });
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
}

// 断开数据库连接
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB连接已断开');
  } catch (error) {
    console.error('断开MongoDB连接失败:', error);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  mongoose
};
