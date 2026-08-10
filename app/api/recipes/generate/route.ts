import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { generatedDishBatchSchema } from "@/lib/recipe-generation";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";

const systemPrompt = `你是中式家庭菜谱编辑器。你必须只输出 JSON，不要输出 Markdown 或解释文字。
JSON 顶层格式为 {"dishes":[{"name":"菜名","desc":"一句话介绍","emoji":"🍳","minutes":30,"calories":500,"protein":30,"cost":12,"tags":["家常"],"ingredients":[{"name":"食材","qty":"两人份数量","category":"蔬菜"}],"steps":["步骤一","步骤二"]}]}。

规则：
- 所有菜谱按两人份生成，步骤具体并适合家庭厨房。
- 食材优先选择美国加州普通超市或亚洲超市可以买到的品种，成本以美元估算。
- 食材分类只能是：主食、肉类、海鲜、蔬菜、水果、蛋奶、豆制品、调味、其他。
- 标签最多 4 个；热量、蛋白质和成本均为整道菜两人份的合理估算。
- 贝类菜谱必须写明清洗、彻底加热以及丢弃烹饪后仍未开口贝类的安全步骤。
- 严格按照用户要求的数量生成，每一道菜都必须填写全部字段，禁止增加空对象或占位对象。
- 不生成数据库 ID、图片地址、作者或时间字段。
- JSON 必须完整有效并严格符合示例字段。`;

class InvalidDeepSeekJsonError extends Error {
  constructor(readonly rawText: string, readonly validation: string) {
    super("INVALID_DEEPSEEK_JSON");
  }
}

function createDeepSeek() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY_MISSING");
  return createOpenAICompatible({
    name: "deepseek",
    apiKey,
    baseURL: DEEPSEEK_BASE_URL,
  });
}

async function generateRecipeBatch(prompt: string, correction = "") {
  const deepseek = createDeepSeek();
  const result = await generateText({
    model: deepseek(process.env.DEEPSEEK_MODEL || DEFAULT_MODEL),
    system: systemPrompt,
    prompt: correction ? `${prompt}\n\n请修正上一份不合格输出。不要增加新的菜，只返回修正后的完整 JSON。\n${correction}` : prompt,
    maxOutputTokens: 8000,
    providerOptions: {
      deepseek: { response_format: { type: "json_object" } },
    },
  });
  try {
    return generatedDishBatchSchema.parse(JSON.parse(result.text));
  } catch (cause) {
    const validation = cause instanceof Error?cause.message:"无法解析 JSON";
    throw new InvalidDeepSeekJsonError(result.text.slice(0,12000),validation.slice(0,3000));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { prompt?: unknown };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (prompt.length < 2) return Response.json({ error: "请描述想生成的菜谱。" }, { status: 400 });
    if (prompt.length > 2000) return Response.json({ error: "需求请控制在 2000 字以内。" }, { status: 400 });

    let correction = "";
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await generateRecipeBatch(prompt,correction);
        return Response.json(result);
      } catch (error) {
        if (attempt === 0 && error instanceof InvalidDeepSeekJsonError) {
          correction = `上一份 JSON：\n${error.rawText}\n\n校验错误：\n${error.validation}`;
          continue;
        }
        throw error;
      }
    }

    return Response.json({ error: "DeepSeek 暂时没有生成有效菜谱，请重试。" }, { status: 502 });
  } catch (error) {
    if (error instanceof Error && error.message === "DEEPSEEK_API_KEY_MISSING") {
      return Response.json({ error: "服务器尚未配置 DEEPSEEK_API_KEY。" }, { status: 503 });
    }
    if (error instanceof InvalidDeepSeekJsonError) {
      return Response.json({ error: "DeepSeek 返回的菜谱格式不完整，请重试或改用 deepseek-v4-pro。" }, { status: 502 });
    }
    console.error("DeepSeek recipe generation failed", error);
    return Response.json({ error: "DeepSeek 生成失败，请稍后重试。" }, { status: 502 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
