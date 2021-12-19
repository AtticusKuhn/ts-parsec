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

and here is a simple JSON parser
```ts
import { manyParser, parser, regexParser, runParser, stringParser } from "./index";
const jsonLineParser: parser<{ fst: string, snd: any }> = () => {
    stringParser(`"`)
    const key = regexParser(/.*?/)()
    stringParser(`"`)
    stringParser(`:`)
    const value = regexParser(/.*?/)()
    stringParser(`,`)
    return {
        fst: key,
        snd: value
    }
}

const jsonParser: parser<object> = () => {
    stringParser("{")
    const a = manyParser(jsonLineParser)()
    stringParser("}")
    return a
}
const a = runParser(jsonParser, `{"a":1}`)
console.log(a)

```