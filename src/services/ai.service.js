// src/services/ai.service.js
import OpenAI from "openai";

const systemPrompt = '你是一名经验丰富的教师，请分析这张试卷：1.逐题解析并给出答案 2.指出学生的错误并给出改进建议 3.使用简洁清晰的教学语言';

let openaiInstance = null;

export const getOpenAI = () => {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.ALI_API_KEY,
      baseURL: process.env.ALI_API_ENDPOINT
    });
  }
  return openaiInstance;
}

export async function aiService(base64Str) {
  const openai = getOpenAI();
  try {
    if (!/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/i.test(base64Str)) {
      throw new Error('无效的Base64格式，示例：data:image/png;base64,iVBORw0KGgo...');
    }
    const completion = await openai.chat.completions.create({
      model: "qwen-vl-max-latest",
      messages: [
        {"role": "system", 
          "content": [{"type":"text","text": "You are a helpful assistant."}]
        },
        {"role": "user",
          "content": [
            {
              "type": "image_url",
              // 需要注意，传入Base64，图像格式（即image/{format}）需要与支持的图片列表中的Content Type保持一致。
              // PNG图像：  data:image/png;base64,${base64Image}
              // JPEG图像： data:image/jpeg;base64,${base64Image}
              // WEBP图像： data:image/webp;base64,${base64Image}
              "image_url": {"url": `${base64Str}`},
            },
            {
              "type": "text",
              "text": `${systemPrompt}`
            }
          ]
        }
      ]
    });
    console.log('completion', completion)
    return completion.choices[0].message.content;
  } catch (err) {
    console.error('AI服务调用异常', err);
    throw new Error(`AI服务异常: ${err.message}`);
  }
}