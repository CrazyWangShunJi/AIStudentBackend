// dotenv 解析.env文件，将解析后的变量挂在到nodejs全局对象 process.env上
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });  // 显式指定路径

// 立即验证环境变量
console.log('验证环境变量:', {
  ALI_API_KEY: process.env.ALI_API_KEY ? '已加载' : '未加载',
  ALI_API_ENDPOINT: process.env.ALI_API_ENDPOINT ? '已加载' : '未加载'
});

import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';  // 注意扩展名

const app = express();

// 中间件
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({
  limit: '50mb',
}));

app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));

// 路由
app.use('/api', apiRouter);

app.use((req, res) => {
  console.log(`收到未处理的路由请求: ${req.method} ${req.path}`);
  res.status(404).json({ error: '路由不存在' });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});