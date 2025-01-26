import * as T from "./type";

export const isToolResponse = (x: any): x is T.ToolResponse =>
  x.type === "tool_use" && x.name !== undefined && x.input !== undefined;

export const isTextResponse = (
  x: T.TextResponse | T.ToolResponse
): x is T.TextResponse => x.type === "text" && x.text !== undefined;

export const processResponse = (
  data: T.ApiResponse
): string | T.ToolResponse => {
  const toolCall = data.content.find(isToolResponse);

  // Handle tool calls in the response
  if (toolCall) {
    return toolCall;
  }

  const textResponse = data.content.find(isTextResponse);

  if (!textResponse) {
    throw new Error("No text response from API");
  }

  return textResponse.text;
};

export const processStream = async (
  response: Response,
  stream: T.StreamingOptions
): Promise<string> => {
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
        stream.onUpdate(data.delta.text);
      }
    }
  }
  return content;
};
//
