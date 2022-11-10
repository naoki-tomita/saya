
type AddExpression = {
  type: "add",
  operator: "+",
  left: Expression;
  right: Expression;
}

type SubtractExpression = {
  type: "subtract",
  operator: "-",
  left: Expression;
  right: Expression;
}

type MultipleExpression = {
  type: "multiple",
  operator: "*",
  left: Expression;
  right: Expression;
}

type DevidedExpression = {
  type: "devide",
  operator: "/",
  left: Expression;
  right: Expression;
}

type OperatedExpression = AddExpression | SubtractExpression | MultipleExpression | DevidedExpression;

type NumberExpression = {
  type: "number";
  value: string;
}

type StringExpression = {
  type: "string";
  value: string;
}

type VariableExpression = {
  type: "variable";
  name: string;
}

type ValueExpression = NumberExpression | StringExpression | VariableExpression;

export type FunctionCallExpression = {
  type: "functioncall";
  function: VariableExpression;
  arguments: ValueExpression[];
};

export type Expression = OperatedExpression | ValueExpression | FunctionCallExpression;

export function parseValueExpression(token: string): ValueExpression {
  if (token.startsWith(`"`) && token.endsWith(`"`)) {
    return {
      type: "string",
      value: token.slice(1, -1)
    }
  } else if (token.match(/^\d+$/)) {
    return {
      type: "number",
      value: token,
    }
  } else {
    return {
      type: "variable",
      name: token,
    }
  }
}

export function parseArgumentExpression(generator: Generator<string>): ValueExpression[] {
  const args: ValueExpression[] = [];
  while (true) {
    const arg = generator.next();
    if (arg.value === ")") {
      return args;
    }
    const separator = generator.next();
    args.push(parseValueExpression(arg.value));
    if (separator.value === ")") {
      return args;
    }
  }
}

export function parseExpression(leftValue: string, generator: Generator<string>): Expression {
  const left = parseValueExpression(leftValue);
  const operator = generator.next();
  if (operator.value === ";") {
    return left;
  } else if (left.type === "variable" && operator.value === "(") {
    return {
      type: "functioncall",
      function: left,
      arguments: parseArgumentExpression(generator),
    }
  } else {
    const right = parseExpression(generator.next().value, generator);
    let operatedExpression: OperatedExpression
    switch (operator.value) {
      case "+":
        operatedExpression = {
          type: "add",
          left,
          operator: "+",
          right,
        };
        break;
      case "-":
        operatedExpression = {
          type: "subtract",
          left,
          operator: "-",
          right,
        };
        break;
      case "*":
        operatedExpression = {
          type: "multiple",
          left,
          operator: "*",
          right,
        };
        break;
      case "/":
        operatedExpression = {
          type: "devide",
          left,
          operator: "/",
          right,
        };
        break;
      default:
        throw Error(`Failed to parse. Unexpected operator "${operator.value}"`);
    }
    return operatedExpression;
  }
}

export type Statement = {
  type: "let" | "const";
  name: string;
  expression: Expression;
}

export function parseDefineVariableStatement(token: "const" | "let", generator: Generator<string>): Statement {
  const name = generator.next();
  const equal = generator.next();
  if (equal.value !== "=") {
    throw Error(`Failed to parse code. expected '=' but was '${equal.value}'`);
  }
  const expressionToken = generator.next().value;
  const expression = parseExpression(expressionToken, generator);
  return {
    type: token,
    name: name.value,
    expression,
  }
}

export function parse(tokens: Generator<string>): Array<Statement | Expression> {
  const results: Array<Statement | Expression> = [];
  let current = tokens.next();
  while (!current.done) {
    if (current.value === "let" || current.value === "const") {
      results.push(parseDefineVariableStatement(current.value, tokens));
    } else if (current.value === ";") {
      // do nothing.
    } else {
      results.push(parseExpression(current.value, tokens))
    }
    current = tokens.next();
  }
  return results;
}
