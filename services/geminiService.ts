
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 利用 Gemini 从预设的 15 条祝福中挑选出最适合该姓名的一条
 */
export const selectBestBlessing = async (name: string, blessings: string[]): Promise<string> => {
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
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    const selected = response.text?.trim();
    // 确保返回的内容确实在预设列表中，如果 AI 胡编乱造则 fallback 随机
    return blessings.includes(selected) ? selected : blessings[Math.floor(Math.random() * blessings.length)];
  } catch (error) {
    console.error("Gemini Selection Error:", error);
    // 网络异常时随机选择一条
    return blessings[Math.floor(Math.random() * blessings.length)];
  }
};
