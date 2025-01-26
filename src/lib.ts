import fs from "fs"; // https://docs.anthropic.com/en/docs/welcome

import { API_KEY } from "./config";
import type { ApiResponse, Options, Tool, ToolResponse } from "./type";
import { processResponse } from "./utils";

const url = "https://api.anthropic.com/v1/messages";

export const genericCall = async (
  messages: { role: "user"; content: string }[],
  options: Partial<Options> = {}
): Promise<string | ToolResponse> => {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
  };

  const {
    temperature = 0,
    max_tokens = 1024,
    model = "claude-3-5-haiku-20241022",
    system,
    tools,
  } = options;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      messages,
      model,
      max_tokens,
      temperature,
      system,
      tools,
      stream: !!options.stream,
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  if (options.stream) {
    console.log("Streaming enabled");
    const reader = response.body?.getReader();
    let content = "";

    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6); // Remove 'data: ' prefix
        if (jsonStr === "[DONE]") break;

        const data = JSON.parse(jsonStr);
        if (data.type === "content_block_delta") {
          content += data.delta.text;
          options.stream.onUpdate(data.delta.text);
        }
      }
    }

    return content;
  }

  const data: ApiResponse = await response.json();

  return processResponse(data);
};

export async function reviewCode(question: string, codeFile: string) {
  const functionCalls: { [k: string]: (x: any) => any } = {
    update_code: (newCode: string) => {
      fs.writeFileSync(codeFile, newCode);
      return true;
    },
  };

  const tools: Tool[] = [
    {
      name: "update_code",
      description: "Update code based on review feedback",
      input_schema: {
        type: "object",
        properties: {
          updatedCode: {
            type: "string",
            description: "The modified code with improvements",
          },
        },
        required: ["updatedCode"],
      },
    },
  ];

  const codeContent = fs.readFileSync(codeFile, "utf-8");

  try {
    const result = await callClaude(
      `${question}\nHere is the code to review:\n${codeContent}`,
      { tools }
    );

    if (typeof result !== "string" && "name" in result) {
      const { name, input } = result;

      // Handle the updated code
      const { updatedCode } = input;

      const fx = functionCalls[name];

      if (!fx) {
        throw "to handle";
      }

      const out = fx(updatedCode);

      return {
        out,
      };
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export const getCode = async (prompt: string) =>
  genericCall([{ role: "user", content: prompt }], {
    system: "You must respond with only code, no explanations or comments.",
  });

export const callClaude = (prompt: string, options: Partial<Options> = {}) =>
  genericCall([{ role: "user", content: prompt }], options);
