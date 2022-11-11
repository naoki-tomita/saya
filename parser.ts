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

type FunctionDefinitionExpression = {
  type: "function";
  name: string;
  arguments: VariableExpression[];
  statements: StatementOrExpression[];
}

type ValueExpression = NumberExpression | StringExpression | VariableExpression;

export type FunctionCallExpression = {
  type: "functioncall";
  function: VariableExpression;
  arguments: Expression[];
};

export type Expression = OperatedExpression | ValueExpression | FunctionCallExpression | FunctionDefinitionExpression;

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

function parseFunctionDefinitionExpression(tokens: string[]): FunctionDefinitionExpression {
  const _func = tokens.shift()!;
  const name = tokens.shift()!;
  tokens.shift(); //remove open brace
  const argumentsParam: VariableExpression[] = [];
  let current = tokens.shift()!;
  while (current !== ")") {
    argumentsParam.push({
      type: "variable",
      name: current,
    });
    if (tokens.shift() === ")") { // remove comma.
      break;
    }
    current = tokens.shift()!
  }

  let braceCount = 0;
  let indexOfEndOfBrace = 0;
  for (let i = 0; i < tokens.length; i++) {
    current = tokens[i];
    if (current === "{") braceCount++;
    if (current === "}") braceCount--;
    if (braceCount === 0) {
      indexOfEndOfBrace = i;
      break;
    }
  }
  const statements = parse(tokens.splice(1, indexOfEndOfBrace - 1));
  tokens.shift() // remove open brace.
  tokens.shift() // remove close brace.

  return {
    type: "function",
    name,
    arguments: argumentsParam,
    statements,
  }
}


const EndOfExpression = [";", undefined];
export function parseExpression(tokens: string[]): Expression {
  const nextToken = tokens[1];
  if (tokens[0] === "func") {
    return parseFunctionDefinitionExpression(tokens);
  } else if (EndOfExpression.includes(nextToken)) {
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


type VariableDefinitionStatement = {
  type: "let" | "const";
  name: string;
  expression: Expression;
}

export type Statement = VariableDefinitionStatement | ReturnStatement;

type ReturnStatement = {
  type: "return",
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

function getStatementOrExpression(tokens: string[]): string[] {
  if (tokens.length === 0) {
    return [];
  }
  const expressionTokens = [];
  let current = tokens.shift()!;
  let braceCount = 0;
  let braceIn = false;
  while (true) {
    if (current === "{") {
      braceCount++;
      braceIn = true;
    }
    if (current === "}") braceCount--;
    expressionTokens.push(current);
    if (braceIn && braceCount === 0) {
      return expressionTokens;
    }
    current = tokens.shift()!;
    if (!braceIn && current === ";") {
      return expressionTokens;
    }
  }
}

function parseReturnStatement(tokens: string[]): ReturnStatement {
  const _ret = tokens.shift()! // return
  const expression = parseExpression(tokens);
  return {
    type: "return",
    expression,
  }
}

type StatementOrExpression = Statement | Expression
export function parse(tokens: string[]): StatementOrExpression[] {
  const results: StatementOrExpression[] = [];
  while (true) {
    const expressionTokens = getStatementOrExpression(tokens);
    if (expressionTokens[0] === "let" || expressionTokens[0]  === "const") {
      results.push(parseDefineVariableStatement(expressionTokens));
    } else if (expressionTokens[0] === "return") {
      results.push(parseReturnStatement(expressionTokens));
    } else if (expressionTokens.length >= 1) {
      results.push(parseExpression(expressionTokens));
    } else {
      return results;
    }
  }
}
