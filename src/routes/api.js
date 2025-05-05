// src/routes/api.js
import express from 'express';
import { aiService } from '../services/ai.service.js';
import { validateImage } from '../utils/validateImage.js';

const router = express.Router();

// 接口1：AI分析
router.post('/ai/imageParse', async (req, res) => {
  try {
    // Extract fileData (base64 or placeholder) and language
    const { fileData, language } = req.body;

    console.log('请求到接口, 语言:', language);
    
    if (!fileData) {
      return res.status(400).json({ error: '缺少文件数据 (fileData)' });
    }
    
    // Optional: Keep image validation if fileData is likely base64 image
    if (fileData !== 'pdf_placeholder') {
        try {
            // Assuming validateImage works on base64 strings
            validateImage(fileData); 
        } catch (validationError) {
             console.error("Image validation failed:", validationError.message);
             // Decide if validation failure is critical
             // return res.status(400).json({ error: validationError.message }); 
        }
    }

    // Call aiService with fileData and language
    const result = await aiService(fileData, language);
    res.json({ success: true, data: result });

  } catch (error) {
    console.error('API Error in /ai/imageParse:', error);
    res.status(500).json({
      success: false,
      error: error.message || '服务器内部错误'
    });
  }
});

// 测试接口
router.post('/test', (req, res) => {
  console.log('测试接口被调用');
  res.send("测试成功！");
});

export default router