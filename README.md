# TS Parsec
This library is ts-parsec, it is inspired by the haskell library parsec

# Example
There is an example in `/src/example.ts`
```ts
import { manyParser, regexParser, runParser } from "./index";

function sampleParser() {
    let a = manyParser(regexParser(/abc/))
    return a;
}
const a = runParser(sampleParser, "abcabcabcabc")
console.log(a) 
/*
will output:


{
  result: [ 'abc', 'abc', 'abc', 'abc' ],
  type: 'success',
  unconsumedInput: ''
}

*/

```