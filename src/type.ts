// https://docs.anthropic.com/en/docs/about-claude/models
// https://docs.anthropic.com/en/docs/about-claude/models#model-comparison-table
export type Model =
  | "claude-3-5-sonnet-latest"
  | "claude-3-sonnet-20240229" // $3.00 / $15.00
  | "claude-3-5-haiku-20241022"; // $0.80 / $4.00

export interface Tool {
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

export interface TextResponse {
  type: "text";
  text: string;
}

export interface ToolResponse {
  type: "tool_use";
  name: string;
  input: {
    [key: string]: any;
  };
}

export type ApiContent = TextResponse | ToolResponse;

export interface ApiResponse {
  content: Array<ApiContent>;
}

export interface StreamingOptions {
  onUpdate: (content: string) => void;
  streaming?: boolean;
}

export interface Options {
  model: Model;
  max_tokens: number;
  temperature: number;
  system: string;
  tools: Tool[];
  stream: StreamingOptions;
}
