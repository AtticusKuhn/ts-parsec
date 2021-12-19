export type parser<Result> = () => Result
// type simpleParser<Result> = parser<never, Result>

let accumulators: string[] = []

export const digitParser: parser<number> = () => {
    if (accumulators.length > 0) {
        let fst = accumulators[0][0]
        if (!isNaN(+fst)) {
            accumulators[0] = accumulators[0].substr(1)
            return Number(fst)
        } else {
            throw new ParserError(errorType.invalidNumberNumberParser, `the digit ${fst} is invalid`)
        }
    } else {
        throw new ParserError(errorType.notEnoughInputForNumberParser)
    }
}
export const stringParser = <T extends string>(inputStr: T): parser<T> => () => {
    if (accumulators[0].substr(0, inputStr.length) === inputStr) {
        accumulators[0] = accumulators[0].substr(inputStr.length)
        return inputStr
    } else {
        throw new ParserError(errorType.stringDoesntMatch, `${accumulators[0].substr(0, inputStr.length)} does not match  ${inputStr}`)
    }
}
/**
  * takes a regex and parses it
   */
export const regexParser = (regex: RegExp): parser<string> => () => {
    // console.log(this)
    const matches = accumulators[0].match(regex)
    if (matches === null || matches === undefined) {
        throw new ParserError(errorType.noMatchesForRegx)
    } else if (matches.index !== undefined && matches.index !== 0) {
        throw new ParserError(errorType.stringDoesntMatchRegex, `the string ${accumulators[0]} doesn't match the regex ${regex.source}`)
    }
    accumulators[0] = accumulators[0].substr(matches[0].length)
    return matches[0]
}
export const manyParser = <B>(parser: parser<B>): parser<B[]> => () => {
    accumulators.unshift(accumulators[0])
    let acc: B[] = []
    while (true) {
        console.log("loop")
        const res = runParser(parser, accumulators[0])
        if (res.type === "fail") {
            break
        } else {
            acc.push(res.result)
            accumulators[0] = res.unconsumedInput
        }
    }
    accumulators[1] = accumulators[0]
    accumulators = accumulators.slice(1)
    return acc
}

// type StringToUnion<A, T extends string> = T extends `${infer A}${infer B}` ? A | StringToUnion<B> : never

export const alternativeParser = <A, B>(parserA: parser<A>, parserB: parser<B>): parser<A | B> => () => {
    accumulators.unshift(accumulators[0])
    const res = runParser(parserA, accumulators[0])
    if (res.type === "fail") {
        accumulators = accumulators.slice(1)
        accumulators.unshift(accumulators[0])
        const resB = runParser(parserB, accumulators[0])
        if (resB.type === "fail") {
            throw new ParserError(errorType.alternaiveFailed)
        } else {
            accumulators[1] = accumulators[0]
            accumulators = accumulators.slice(1)
            accumulators[0] = resB.unconsumedInput
            return resB.result
        }
    } else {
        accumulators[1] = accumulators[0]
        accumulators = accumulators.slice(1)
        accumulators[0] = res.unconsumedInput
        return res.result
    }
}
export const alternativesParser = <K>(...parsers: Array<parser<K>>): parser<K> => () => {
    accumulators.unshift(accumulators[0])
    for (const parser of parsers) {
        const res = runParser(parser, accumulators[0])
        if (res.type === "success") {
            accumulators[1] = accumulators[0]
            accumulators = accumulators.slice(1)
            accumulators[0] = res.unconsumedInput
            return res.result
        }
    }
    throw new ParserError(errorType.alternaiveFailed)
}
export const pipe = <B, C>(parser: parser<B>, pipeFunction: (b: B) => C): parser<C> => {
    return () => {
        let temp = parser();
        return pipeFunction(temp)
    }
}

class ParserError extends Error {
    date: Date;
    constructor(public type: errorType = errorType.notEnoughInputForNumberParser, public msg?: string, ...params: any[]) {
        super(...params)
        this.name = 'ParserError'
        this.date = new Date()
    }
}
enum errorType {
    notEnoughInputForNumberParser = "not enough input for number parser",
    invalidNumberNumberParser = "invalid number in number parser",
    noMatchesForRegx = "no matches for regex",
    stringDoesntMatchRegex = "string doesn't match the regex",
    stringDoesntMatch = "input string does not match in string parser",
    alternaiveFailed = "both branches of alternative failed",
}
type runParserResult<T> = { type: "success", result: T, unconsumedInput: string }
    | { type: "fail", error: ParserError }
export const runParser = <T>(parser: parser<T>, inputString: string): runParserResult<T> => {
    accumulators.unshift(inputString)
    try {
        const result = parser();
        const unconsumedInput = accumulators[0];
        accumulators = accumulators.slice(1)
        return {
            result,
            type: "success",
            unconsumedInput,
        }
    } catch (e: any) {
        accumulators = accumulators.slice(1)
        return {
            error: e,
            type: "fail",
        }
    }
}