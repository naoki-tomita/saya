import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { parse, parseArgumentExpression, parseExpression, parseValueExpression } from "./parser.ts"


function *toGenerator(array: string[]) {
  for (const item of array) {
    yield item;
  }
}

Deno.test("Parse functioncall", () => {
  const code = [
    "someFunction", "(", "foo", ",", `"bar"`, ",", "42", ",", "hoge", "(", ")", ")", ";"
  ];
  const ast = parseExpression("someFunction", toGenerator(code.slice(1)))
  assertEquals(ast, {
    type: "functioncall",
    function: {
      type: "variable",
      name: "someFunction",
    },
    arguments: [
      {
        type: "variable",
        name: "foo"
      },
      {
        type: "string",
        value: "bar",
      },
      {
        type: "number",
        value: "42"
      },
      {
        type: "functioncall",
        function: {
          type: "variable",
          name: "hoge"
        },
        arguments: []
      }
    ]
  });
});


// parse
Deno.test("Parse const statement", () => {
  const code = [
    "const", "varName", "=", "123", ";"
  ];
  const ast = parse(toGenerator(code));
  assertEquals(ast, [
    {
      type: "const",
      name: "varName",
      expression: {
        type: "number",
        value: "123",
      }
    }
  ]);
});

Deno.test("Parse let statement", () => {
  const code = [
    "let", "varName", "=", "123", ";"
  ];
  const ast = parse(toGenerator(code));
  assertEquals(ast, [
    {
      type: "let",
      name: "varName",
      expression: {
        type: "number",
        value: "123",
      }
    }
  ]);
});

Deno.test("Parse operation expression", () => {
  const code = [
    "1", "+", "1", ";"
  ];
  const ast = parse(toGenerator(code));
  assertEquals(ast, [
    {
      type: "add",
      operator: "+",
      left: {
        type: "number",
        value: "1"
      },
      right: {
        type: "number",
        value: "1"
      }
    }
  ]);
});

Deno.test("Parse multiple operation expression sorted by calc order.", () => {
  const code = [
    "1", "+", "1", "-", "2", "*", "3", "/", "4", ";"
  ]
  const ast = parse(toGenerator(code));
  assertEquals(ast, [
    {
      type: "devide",
      operator: "/",
      left: {
        type: "multiple",
        operator: "*",
        left: {
          type: "add",
          operator: "+",
          left: {
            type: "number",
            value: "1",
          },
          right: {
            type: "subtract",
            operator: "-",
            left: {
              type: "number",
              value: "1"
            },
            right: {
              type: "number",
              value: "2"
            }
          }
        },
        right: {
          type: "number",
          value: "3"
        }
      },
      right: {
        type: "number",
        value: "4"
      }
    }
  ]);
});