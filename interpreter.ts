import { Expression, FunctionCallExpression, Statement } from "./parser.ts";

type Memory = Record<string, any>

const global: Memory = {
  println: (...args: any) => {
    console.log(args);
  },
};

function throws(error: any) {
  throw error;
}

export function exec(ast: Array<Statement | Expression>, stack: Memory[]): Memory[] {
  const memory: Memory = {};

  function access(name: string): any {
    return memory[name] ?? global[name] ?? throws(Error(`Variable ${name} does not defined`));
  }

  function call(expression: FunctionCallExpression): any {
    return access(expression.function.name)(...expression.arguments.map(it => {
      switch (it.type) {
        case "variable":
          return access(it.name);
        default:
          return it.value;
      }
    }))
  }

  function execExpression(expression: Expression): string | number {
    switch (expression.type) {
      case "number":
        return parseInt(expression.value, 10);
      case "string":
        return expression.value;
      case "variable":
        return access(expression.name);
      case "functioncall":
        return call(expression);
    }
    const left = execExpression(expression.left);
    const right = execExpression(expression.right);
    switch (expression.type) {
      case "add":
        return (left as any + (right as any));
      case "subtract":
        return (left as number - (right as number));
      case "multiple":
        return (left as number * (right as number));
      case "devide":
        return (left as number / (right as number));
    }
  }

  stack.push(memory)
  if (Array.isArray(ast)) {
    for (const el of ast) {
      if (el.type === "const" || el.type === "let") {
        memory[el.name] = execExpression(el.expression);
      } else {
        execExpression(el as Expression);
      }

    }
  }
  return stack;
}