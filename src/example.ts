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

