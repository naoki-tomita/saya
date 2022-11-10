
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
  value: number;
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

function valueExpresson(token: string): ValueExpression {
  if (token.startsWith(`"`) && token.endsWith(`"`)) {
    return {
      type: "string",
      value: token.slice(1, -1)
    }
  } else if (token.match(/^\d+$/)) {
    const numberValue = parseInt(token, 10);
    return {
      type: "number",
      value: numberValue,
    }
  } else {
    return {
      type: "variable",
      name: token,
    }
  }
}

function argumentsExpression(generator: Generator<string>): ValueExpression[] {
  const args: ValueExpression[] = [];
  while (true) {
    const arg = generator.next();
    if (arg.value === ")") {
      return args;
    }
    const separator = generator.next();
    args.push(valueExpresson(arg.value));
    if (separator.value === ")") {
      return args;
    }
  }
}

function expressionParser(leftValue: string, generator: Generator<string>): Expression {
  const left = valueExpresson(leftValue);
  const operator = generator.next();
  if (operator.value === ";") {
    return left;
  } else if (left.type === "variable" && operator.value === "(") {
    return {
      type: "functioncall",
      function: left,
      arguments: argumentsExpression(generator),
    }
  } else {
    const right = expressionParser(generator.next().value, generator);
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

function letParser(generator: Generator<string>): Statement {
  const name = generator.next();
  const equal = generator.next();
  if (equal.value !== "=") {
    throw Error(`Failed to parse code. expected '=' but was '${equal.value}'`);
  }
  const expressionToken = generator.next().value;
  const expression = expressionParser(expressionToken, generator);
  return {
    type: "let",
    name: name.value,
    expression,
  }
}

function constParser(generator: Generator<string>): Statement {
  const name = generator.next();
  const equal = generator.next();
  if (equal.value !== "=") {
    throw Error(`Failed to parse code. expected '=' but was '${equal.value}'`);
  }
  const expressionToken = generator.next().value;
  const expression = expressionParser(expressionToken, generator);
  return {
    type: "const",
    name: name.value,
    expression,
  }
}

export function parser(tokens: Generator<string>): Array<Statement | Expression> {
  const results: Array<Statement | Expression> = [];
  let current = tokens.next();
  while (!current.done) {
    if (current.value === "let") {
      results.push(letParser(tokens));
    } else if (current.value === "const") {
      results.push(constParser(tokens));
    } else if (current.value === ";") {
      // do nothing.
    } else {
      results.push(expressionParser(current.value, tokens))
    }
    current = tokens.next();
  }
  return results;
}
