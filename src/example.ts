import { manyParser, regexParser, runParser } from "./index";

function twonumberparser() {
    let a = manyParser(regexParser(/abc/))
    return a;
}
const a = runParser(twonumberparser, "abcabcabcabc")
console.log(a)

