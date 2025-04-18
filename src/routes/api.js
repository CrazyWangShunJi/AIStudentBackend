// src/routes/api.js
import express from 'express';
import { aiService } from '../services/ai.service.js';
import { validateImage } from '../utils/validateImage.js';

const router = express.Router();

// 接口1：AI分析
router.post('/ai/imageParse', async (req, res) => {
  try {
    const { image: base64Image } = req.body;

    console.log('请求到接口')
    if (!base64Image) {
      return res.status(400).json({ error: '缺少图片数据' });
    }
    validateImage(base64Image)

    const result = await aiService(base64Image);
    res.json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 测试接口
router.post('/test', (req, res) => {
  console.log('测试接口被调用');
  res.send("测试成功！");
});

export default router