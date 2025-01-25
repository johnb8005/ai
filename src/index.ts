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
