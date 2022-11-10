import { ControlTokens } from "./tokenizer.ts";

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
  arguments: Expression[];
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

const EndOfArgumentExpression = [","];

function parseFunctionExpression(tokens: string[]): FunctionCallExpression {
  const firstExpression = parseValueExpression(tokens.shift()!)
  const indexOfEndOfBrace = findEndOfBraceIndex(tokens);
  const args = tokens.splice(1, indexOfEndOfBrace - 1);
  tokens.shift() // remove open brace.
  tokens.shift() // remove close brace.

  if (firstExpression.type !== "variable") {
    throw Error(`Unexpected function call: ${tokens.join(" ")}`)
  }

  return {
    type: "functioncall",
    function: firstExpression,
    arguments: parseArgumentExpression(args),
  }
}

export function parseArgumentExpression(tokens: string[]): Expression[] {
  const args: Expression[] = [];
  while (tokens.length >= 1) {
    if (isVariableLike(tokens[0]) && tokens[1] === "(") {
      args.push(parseFunctionExpression(tokens))
    } else {
      const index = tokens.findIndex(t => EndOfArgumentExpression.includes(t));
      const arg = parseExpression(index !== -1 ? tokens.splice(0, index) : tokens);
      args.push(arg);
      tokens.shift() // remove comma
    }
  }
  return args;
}

function findEndOfBraceIndex(tokens: string[]) {
  let braceStack = 0;
  // find end of brace.
  for (let i = 0; i < tokens.length; i++) {
    const currentToken = tokens[i];
    if (currentToken === "(") braceStack++
    if (currentToken === ")") braceStack--;
    if (braceStack === 0) {
      return i;
    }
  }
  return -1;
}

const ReservedWord = ["func"]

function isVariableLike(token: string): boolean {
  if (token.startsWith(`"`) && token.endsWith(`"`)) {
    return false;
  }
  if (token.match(/^\d+$/)) {
    return false;
  }
  if (ReservedWord.includes(token)) {
    return false;
  }
  if (ControlTokens.includes(token)) {
    return false;
  }
  return true;
}

const EndOfExpression = [";", undefined];
export function parseExpression(tokens: string[]): Expression {
  const nextToken = tokens[1];
  if (EndOfExpression.includes(nextToken)) {
    return parseValueExpression(tokens[0]);
  } else if (isVariableLike(tokens[0]) && nextToken === "(") {
    return parseFunctionExpression(tokens);
  } else {
    // calculation of number or string.
    const left = parseExpression([tokens[0]]);
    const operator = tokens[1];
    const right = parseExpression(tokens.slice(2));
    let operatedExpression: OperatedExpression
    switch (operator) {
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
        throw Error(`Failed to parse. Unexpected operator "${operator}"`);
    }
    return operatedExpression;
  }
}

export type Statement = {
  type: "let" | "const";
  name: string;
  expression: Expression;
}

export function parseDefineVariableStatement(tokens: string[]): Statement {
  const type = tokens.shift() as "let" | "const";
  const name = tokens.shift()!;
  const equal = tokens.shift();
  if (equal !== "=") {
    throw Error(`Failed to parse code. expected '=' but was '${equal}'`);
  }
  const expression = parseExpression(tokens);
  return {
    type,
    name,
    expression,
  }
}

function getStatementOrExpression(tokens: Generator<string>): string[] {
  const expressionTokens = [];
  let current = tokens.next();
  while (current.value !== ";" && !current.done) {
    expressionTokens.push(current.value);
    current = tokens.next();
  }
  return expressionTokens;
}

export function parse(tokens: Generator<string>): Array<Statement | Expression> {
  const results: Array<Statement | Expression> = [];
  while (true) {
    const expressionTokens = getStatementOrExpression(tokens);
    if (expressionTokens[0] === "let" ||expressionTokens[0]  === "const") {
      results.push(parseDefineVariableStatement(expressionTokens));
    } else if (expressionTokens.length >= 1) {
      results.push(parseExpression(expressionTokens));
    } else {
      return results;
    }
  }
}
