import sizeOf from 'image-size';
import { Buffer } from 'buffer';

export const validateImage = (base64Str) => {
  const base64Data = base64Str.split(',')[1];

  if (!base64Str) {
    throw new Error('Base64格错误，必须要包含MIME类型前缀')
  }

  // 计算实际文件大小
  const fileSizeMB = (Buffer.byteLength(base64Data, 'utf8') * 3/4) / (1024 * 1024);

  if (fileSizeMB > 10) {
    console.log('err', '图像大小超过限制')
    throw new Error(`图像大小${fileSizeMB.toFixed(2)}MB超过10MB限制`);
  }

  // 解码图像元数据
  const buffer = Buffer.from(base64Data, 'base64');
  const dimensions = sizeOf(buffer);

  if (dimensions.width < 11 || dimensions.height < 11) {
    throw new Error(`图像尺寸过小（${dimensions.width}x${dimensions.height}），最小要求11x11像素`);
  }

  // 宽高比验证
  const aspectRatio = dimensions.width / dimensions.height;
  if (aspectRatio > 200 || aspectRatio < 1/200) {
    throw new Error(`宽高比${aspectRatio.toFixed(2)}超过200:1限制`);
  }
  
  return true;
}
