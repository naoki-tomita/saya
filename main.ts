import { exec } from "./interpreter.ts";
import { parse } from "./parser.ts";
import { tokenize } from "./tokenizer.ts";

const text = await Deno.readTextFile(Deno.args[0]);
const tokens = tokenize(text);
// console.log([...tokens])
const ast = parse(tokens);
console.log(JSON.stringify(ast, null, "  "));
const result = exec(ast, []);
// console.log(result);