// src/controllers/upload.controller.js
import axios from 'axios';

exports.uploadAndOCR = async (req, res) => {
  try {
    // ----------------------------
    // 关键校验代码
    // ----------------------------
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        success: false,
        error: '非法数据格式：必须传输二进制流'
      });
    }

    // 附加校验：验证是否为常见图片格式（可选）
    const isImage = validateImageMagicNumber(req.body);
    if (!isImage) {
      return res.status(400).json({
        success: false,
        error: '非法文件类型：仅支持 PNG/JPG/JPEG'
      });
    }
    // ----------------------------

    const ocrResponse = await axios.post(
      process.env.OCR_API_ENDPOINT,
      req.body, // 已经是校验过的 Buffer
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-ti-app-id': process.env.OCR_API_X_TI_APP_ID,
          'x-ti-secret-code': process.env.OCR_API_X_TI_SECRET_CODE
        }
      }
    );

    res.json({ success: true, data: ocrResponse.data });
  } catch (error) {
    console.error('[OCR Error]', error);
    res.status(500).json({ success: false, error: '识别失败' });
  }
};

// 校验图片魔数（文件头签名）
function validateImageMagicNumber(buffer) {
  const signatures = {
    png: Buffer.from([0x89, 0x50, 0x4E, 0x47]),
    jpg: Buffer.from([0xFF, 0xD8, 0xFF]),
    jpeg: Buffer.from([0xFF, 0xD8, 0xFF])
  };

  return Object.values(signatures).some(sig => 
    buffer.slice(0, sig.length).equals(sig)
  );
}