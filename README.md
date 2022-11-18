# saya

* [x] define immutable constant.
* [ ] define mutable variable.
* [x] call built-in function.
  * `println`: print log.
* [x] four arithmetic operations.
  * [ ] correct operation order calculation.
* [x] define function.
* [x] call user defined function.

```
const x = 128 + 64;
let i = 99 + 1 - 2 * 5;
const y = x + 5;
const hoge = "fuga hoge" + " " + "foo bar";
const x = hoge;

func someFunc(arg1, arg2) {
  const x = arg1 + arg2;
  return x;
}

println(hoge, "1", 10, y, x, someFunc(42, 42));
```
