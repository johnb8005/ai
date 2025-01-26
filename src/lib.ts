import fs from "fs"; // https://docs.anthropic.com/en/docs/welcome

import { API_KEY } from "./config";

const url = "https://api.anthropic.com/v1/messages";

// https://docs.anthropic.com/en/docs/about-claude/models
// https://docs.anthropic.com/en/docs/about-claude/models#model-comparison-table
type Model =
  | "claude-3-5-sonnet-latest"
  | "claude-3-sonnet-20240229" // $3.00 / $15.00
  | "claude-3-5-haiku-20241022"; // $0.80 / $4.00

interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
}

export async function genericCall(
  messages: { role: "user"; content: string }[],
  options: {
    model?: Model;
    max_tokens?: number;
    temperature?: number;
    system?: string;
    tools?: Tool[];
  } = {}
) {
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
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  const data: { content: any[] } = await response.json();

  const toolCall = data.content.find((x) => x.type === "tool_use");

  // Handle tool calls in the response
  if (toolCall) {
    return toolCall;
  }

  return data.content[0].text;
}

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

export const callClaude = (
  prompt: string,
  options: {
    model?: Model;
    max_tokens?: number;
    temperature?: number;
    system?: string;
    tools?: Tool[];
  } = {}
) => genericCall([{ role: "user", content: prompt }], options);
