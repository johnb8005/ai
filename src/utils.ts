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
