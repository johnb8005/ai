import { getCode } from "./lib";

// Example usage
getCode("Write a function that sorts an array")
  .then((code) => console.log(code))
  .catch((err) => console.error(err));
