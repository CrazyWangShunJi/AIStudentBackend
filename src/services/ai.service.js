// src/services/ai.service.js
import OpenAI from "openai";
import { prompt } from '../utils/chTips.js';

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

export async function aiService(base64OrPlaceholder, language = 'zh-CN') {
  const openai = getOpenAI();
  try {
    // --- DEBUG: Log input ---
    console.log('[DEBUG] aiService called with:');
    // console.log('  base64OrPlaceholder (start):', base64OrPlaceholder ? base64OrPlaceholder.substring(0, 50) + '...' : 'null'); // Log only beginning
    console.log('  language:', language);
    // --- END DEBUG ---
    
    if (base64OrPlaceholder !== 'pdf_placeholder' && !/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/i.test(base64OrPlaceholder)) {
      throw new Error('无效的Base64格式');
    }
    console.log(`发起AI调用，语言: ${language}`);

    const currentPrompt = prompt(language);
    
    let userContent = []; // Initialize content array

    if (base64OrPlaceholder === 'pdf_placeholder') {
       // PDF placeholder: Only text content
       userContent.push({ "type": "text", "text": `${currentPrompt}` });
       console.log('Sending PDF analysis request (placeholder)...');
    } else {
       // Image: Combine image_url and text in the same content array
       userContent.push({ 
         "type": "image_url",
         "image_url": {"url": `${base64OrPlaceholder}`}
       });
       userContent.push({ 
         "type": "text", 
         "text": `${currentPrompt}` 
       });
       console.log('Sending Image analysis request...');
    }

    const messages = [
      {"role": "system", 
        "content": [{"type":"text","text": "You are a helpful assistant acting as a test paper analyzer."}]
      },
      {"role": "user",
        "content": userContent // Assign the built array here
      }
    ];
    
    // --- DEBUG: Log request payload ---
    console.log('[DEBUG] OpenAI Request Payload:');
    console.log(JSON.stringify({ model: "qwen-vl-max", messages: messages }, null, 2));
    // --- END DEBUG ---

    const completion = await openai.chat.completions.create({
      model: "qwen-vl-max",
      messages: messages
    });
    
    // --- DEBUG: Log response ---
    console.log('[DEBUG] OpenAI Response received:');
    // console.log(JSON.stringify(completion, null, 2)); // Can be very verbose
    console.log('  Finish Reason:', completion.choices?.[0]?.finish_reason);
    // --- END DEBUG ---
    
    console.log('AI completion received.');
    if (completion.choices && completion.choices.length > 0 && completion.choices[0].message && completion.choices[0].message.content) {
       // --- DEBUG: Log successful content ---
       console.log('[DEBUG] AI Response Content (start):', completion.choices[0].message.content.substring(0, 100) + '...');
       // --- END DEBUG ---
       return completion.choices[0].message.content;
    } else {
       console.error('[ERROR] AI did not return valid response content. Completion:', JSON.stringify(completion));
       throw new Error('AI did not return a valid response content.');
    }

  } catch (err) {
    console.error('AI服务调用异常 (Full Error):', err);
    const errorMessage = err.response?.data?.error?.message || err.message || '未知AI服务错误';
    // --- DEBUG: Log specific error details ---
    console.error('[ERROR] Extracted Error Message:', errorMessage);
    if (err.response?.data) {
       console.error('[ERROR] Error Response Data:', JSON.stringify(err.response.data));
    }
    // --- END DEBUG ---
    throw new Error(`AI服务异常: ${errorMessage}`);
  }
}