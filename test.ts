import { exec } from "./interpreter.ts";
import { parser } from "./parser.ts";
import { tokenize } from "./tokenizer.ts";

const text = await Deno.readTextFile("./test.sy");
const tokens = tokenize(text);
// console.log([...tokens])
const ast = parser(tokens);
// console.log(ast);
const result = exec(ast, []);
// console.log(result);