const SkipTokens = [" ", "\t", "\n"];
const ControlTokens = [
  ";",
  `"`,
  "+", "-", "*", "/", "=",
  "(", ")",
  ","
];

export function *tokenize(code: string): Generator<string> {
  let tmp = "";
  for (let i = 0; i < code.length; i++) {
    if (SkipTokens.includes(code[i])) {
      continue;
    } else if (code[i] === `"`) {
      // string parse mode.
      do {
        tmp += code[i++];
      } while (code[i] !== `"`)
      tmp += code[i];
      yield tmp;
    } else {
      // default parse mode.
      while (!ControlTokens.includes(code[i]) && !SkipTokens.includes(code[i])) {
        tmp += code[i++];
      }
      if (tmp !== "") {
        yield tmp;
      }
      if (!SkipTokens.includes(code[i])) {
        yield code[i];
      }
    }
    tmp = "";
  }
}
