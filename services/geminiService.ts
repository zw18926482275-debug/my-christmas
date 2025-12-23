
import { GoogleGenAI } from "@google/genai";

// 🔴 修改点 1：变量获取方式
// 原来是: process.env.API_KEY (浏览器里没有 process，会报错)
// 改为: import.meta.env.VITE_GEMINI_API_KEY (这是 Vite 项目的标准写法)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// 🔴 修改点 2：初始化保护
// 初始化 SDK。如果没有 Key，我们传入空字符串，防止页面一打开就白屏崩溃。
const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * 利用 Gemini 从预设的 15 条祝福中挑选出最适合该姓名的一条
 */
export const selectBestBlessing = async (name: string, blessings: string[]): Promise<string> => {
  // 🔴 修改点 3：增加安全检查
  // 如果没有 Key，直接跳过 AI 请求，返回随机祝福，避免不必要的报错
  if (!apiKey) {
    console.warn("未检测到 API Key，降级为随机模式");
    return blessings[Math.floor(Math.random() * blessings.length)];
  }

  try {
    const prompt = `你是一位精通文字艺术与意境匹配的圣诞使者。
    现在有 15 条极具诗意的圣诞祝福语：
    ${blessings.map((b, i) => `${i + 1}. ${b}`).join('\n')}
    
    请根据用户姓名 "${name}" 的字面含义、音律或可能带有的意境，从上述 15 条中挑选出【最契合】的一条。
    
    约束条件：
    1. 必须原封不动地返回选中的那条祝福语全文。
    2. 不要输出任何多余的解释、序号或引导词。
    3. 只输出文案内容本身。`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // 建议改用这个模型，更稳定。原来的 'gemini-3-flash-preview' 可能不稳定
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // 适配 SDK 的返回结构
    const selected = response.response.text().trim();
    
    // 确保返回的内容确实在预设列表中，如果 AI 胡编乱造则 fallback 随机
    return blessings.includes(selected) ? selected : blessings[Math.floor(Math.random() * blessings.length)];
  } catch (error) {
    console.error("Gemini Selection Error:", error);
    // 网络异常时随机选择一条
    return blessings[Math.floor(Math.random() * blessings.length)];
  }
};
  
