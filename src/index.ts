type parser<Result> = () => Result
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
    // console.log("matches[0].length", matches[0].length)
    // console.log(`accumulators[0].substr(matches[0].length + 1)`, accumulators[0].substr(matches[0].length))
    accumulators[0] = accumulators[0].substr(matches[0].length)
    return matches[0]
}
export const manyParser = <B>(parser: parser<B>): B[] => {
    // return () => {
    console.log(accumulators)
    accumulators.unshift(accumulators[0])
    let acc: B[] = []
    // console.log(accumulators)

    while (true) {
        const res = runParser(parser, accumulators[0])
        // console.log("res in many parser", res)
        // console.log(" accumularors in many parser", accumulators)

        if (res.type === "fail") {
            break
        } else {
            acc.push(res.result)
            accumulators[0] = res.unconsumedInput
        }

    }
    accumulators[1] = accumulators[0]
    accumulators = accumulators.slice(1)
    // console.log('after', accumulators)
    return acc
    // }
}
export const pipe = <B, C>(parser: parser<B>, pipeFunction: (b: B) => C): parser<C> => {
    return () => {
        let temp = parser();
        return pipeFunction(temp)
    }
}
// export const pipe =
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
    stringDoesntMatchRegex = "string doesn't match the regex"

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