import { callClaude } from "./lib";

// Example usage
async function example() {
  try {
    const result = await callClaude("What is the capital of France?");
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

example();

type FunctionCall = "get_weather";

const functionCalls: { [functionCall in FunctionCall]?: (x: any) => any } = {
  get_weather: (_city: string) => Math.random() * 60 - 15,
};

async function weather(locationInput: string) {
  const tools = [
    {
      name: "get_weather",
      description: "Get the current weather in a given location",
      input_schema: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
        },
        required: ["location"],
      },
    },
  ];

  try {
    const result = await callClaude(
      `What is the weather in ${locationInput}?`,
      {
        tools,
      }
    );
    console.log("re", result);
    if (typeof result !== "string" && "name" in result) {
      const {
        name,
        input,
      }: { name: FunctionCall; input: { [k: string]: any } } = result;

      const fx = functionCalls[name];

      if (!fx) {
        throw "to handle";
      }

      const temp = fx(input);

      console.log("Temperature:", temp);

      // Here you would handle the tool call by calling your actual weather API

      // Second call to get contextual response
      const finalResponse = await callClaude(
        `The current temperature in ${input.location} is ${temp}°C. Please provide a natural response about the weather.`,
        {
          system:
            "Respond conversationally about the weather based on the temperature provided.",
        }
      );

      console.log("Final response:", finalResponse);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

weather("Dubai");
