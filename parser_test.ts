import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { parse, parseArgumentExpression, parseExpression, parseValueExpression } from "./parser.ts"


function *toGenerator(array: string[]) {
  for (const item of array) {
    yield item;
  }
}

Deno.test("Parse no args function call", () => {
  const code = [
    "someFunction", "(", ")"
  ];
  const ast = parseExpression(code)
  assertEquals(ast, {
    type: "functioncall",
    function: {
      type: "variable",
      name: "someFunction",
    },
    arguments: []
  });
});

Deno.test("Parse 1 args function call",() => {
  const code = [
    "someFunction", "(", "42", ")"
  ];
  const ast = parseExpression(code)
  assertEquals(ast, {
    type: "functioncall",
    function: {
      type: "variable",
      name: "someFunction",
    },
    arguments: [
      {
        type: "number",
        value: "42"
      }
    ]
  });
});
const only = { only: true };

Deno.test("Parse complex functioncall", () => {
  const code = [
    "println", "(", "hoge", ",", `"1"`, ",", "10", ",", "y", ",", "x", ",", "someFunc", "(", `"foo"`, ",", "42", ")", ")"
  ]
  const ast = parseExpression(code)
  assertEquals(ast, {
    type: "functioncall",
    function: {
      name: "println",
      type: "variable",
    },
    arguments: [
      {
        name: "hoge",
        type: "variable",
      },
      {
        type: "string",
        value: "1",
      },
      {
        type: "number",
        value: "10",
      },
      {
        name: "y",
        type: "variable",
      },
      {
        name: "x",
        type: "variable",
      },
      {
        type: "functioncall",
        function: {
          name: "someFunc",
          type: "variable",
        },
        arguments: [
          {
            type: "string",
            value: "foo",
          },
          {
            type: "number",
            value: "42",
          },
        ],
      },
    ],
  });
});

Deno.test("Parse functioncall", () => {
  const code = [
    "someFunction", "(", "foo", ",", `"bar"`, ",", "42", ",", "hoge", "(", ")", ")"
  ];
  const ast = parseExpression(code)
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

Deno.test("Parse multiple operation expression sorted by calc order.", { ignore: true }, () => {
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