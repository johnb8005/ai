import { callClaude } from "./lib";

// Check if a query is provided as a command-line argument
if (process.argv.length < 3) {
  console.log("Please provide a query as a command-line argument");
  process.exit(1);
}

// Join all arguments after the script name
const query = process.argv.slice(2).join(" ");

const result = await callClaude(query, { stream: {
    onUpdate: (content) => console.log(content)
  }});
console.log(result);
