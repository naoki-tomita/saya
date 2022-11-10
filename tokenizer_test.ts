import { assert, assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { tokenize } from "./tokenizer.ts";

Deno.test("const statement should be tokenized.", () => {
  const code = `
    const xx = "string";
  `;
  const tokens = [...tokenize(code)];
  const expected = ["const", "xx", "=", `"string"`, ";"]
  assertEquals(tokens, expected);
});

Deno.test("let statement should be tokenized.", () => {
  const code = `
    let yy = 13 + 24;
  `;
  const tokens = [...tokenize(code)];
  const expected = ["let", "yy", "=", "13", "+", "24", ";"]
  assertEquals(tokens, expected);
});

Deno.test("function call expression should be tokenized.", () => {
  const code = `
    someFunction(foo, "bar", 42, hoge());
  `;
  const tokens = [...tokenize(code)];
  const expected = ["someFunction", "(", "foo", ",", `"bar"`, ",", "42", ",", "hoge", "(", ")", ")", ";"];
  assertEquals(tokens, expected);
});

Deno.test("nested function call expression should be tokenized.", () => {
  const code = `
    println(foo("hoge"));
  `;
  const tokens = [...tokenize(code)];
  const expected = ["println", "(", "foo", "(", `"hoge"`, ")", ")", ";"];
  assertEquals(tokens, expected);
});
