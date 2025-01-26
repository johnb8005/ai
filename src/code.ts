import path from "path";
import { reviewCode } from "./lib";

// Check if a query is provided as a command-line argument
if (process.argv.length < 4) {
  console.log(
    "Please provide a query as a command-line argument and a path to a file"
  );
  process.exit(1);
}

// Join all arguments after the script name
const [query, filePath] = process.argv.slice(2);
const absolutePath = path.resolve(filePath);

// Example usage
reviewCode(query, absolutePath);
