import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { tokenize } from "./tokenizer.ts";

Deno.test("some arg and return string function definition should be tokenized.", () => {
  const code = `
    func funcName(arg1, arg2) {
      return "success";
    }
  `;
  const tokens = tokenize(code);
  const expected = ["func", "funcName", "(", "arg1", ",", "arg2", ")", "{", "return", `"success"`, ";", "}"]
  assertEquals(tokens, expected);
});

Deno.test("minified function definition should be tokenized.", () => {
  const code = `
    func funcName() {println("Hello world");}
  `;
  const tokens = tokenize(code);
  const expected = ["func", "funcName", "(", ")", "{", "println", "(", `"Hello world"`, ")", ";", "}"]
  assertEquals(tokens, expected);
});

Deno.test("no arg void function definition should be tokenized.", () => {
  const code = `
    func funcName() {
      println("Hello world");
    }
  `;
  const tokens = tokenize(code);
  const expected = ["func", "funcName", "(", ")", "{", "println", "(", `"Hello world"`, ")", ";", "}"]
  assertEquals(tokens, expected);
});

Deno.test("const statement should be tokenized.", () => {
  const code = `
    const xx = "string";
  `;
  const tokens = tokenize(code);
  const expected = ["const", "xx", "=", `"string"`, ";"]
  assertEquals(tokens, expected);
});

Deno.test("let statement should be tokenized.", () => {
  const code = `
    let yy = 13 + 24;
  `;
  const tokens = tokenize(code);
  const expected = ["let", "yy", "=", "13", "+", "24", ";"]
  assertEquals(tokens, expected);
});

Deno.test("function call expression should be tokenized.", () => {
  const code = `
    someFunction(foo, "bar", 42, hoge());
  `;
  const tokens = tokenize(code);
  const expected = ["someFunction", "(", "foo", ",", `"bar"`, ",", "42", ",", "hoge", "(", ")", ")", ";"];
  assertEquals(tokens, expected);
});

Deno.test("nested function call expression should be tokenized.", () => {
  const code = `
    println(foo("hoge"));
  `;
  const tokens = tokenize(code);
  const expected = ["println", "(", "foo", "(", `"hoge"`, ")", ")", ";"];
  assertEquals(tokens, expected);
});
