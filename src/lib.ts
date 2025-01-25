import { API_KEY } from "./config";

const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
  "anthropic-version": "2023-06-01",
};

const url = "https://api.anthropic.com/v1/messages";

export async function genericCall(
  messages: { role: "user"; content: string }[],
  options: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    system?: string;
  } = {}
) {
  const {
    temperature = 0,
    max_tokens = 1024,
    model = "claude-3-sonnet-20240229",
    system,
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
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export const getCode = async (prompt: string) =>
  genericCall([{ role: "user", content: prompt }], {
    system: "You must respond with only code, no explanations or comments.",
  });

export const callClaude = (prompt: string) =>
  genericCall([{ role: "user", content: prompt }]);
