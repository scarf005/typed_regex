// deno-lint-ignore-file no-explicit-any ban-types
// TODO: (bug) nested * is not set as optional
// TODO: Create some parse errors in invalid cases
// TODO: Parse normal captures in a typed tuple?

type ReError<T extends string> = { type: T }

// Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp
type Flag = "d" | "g" | "i" | "m" | "s" | "u" | "y"

// deno-fmt-ignore
type FlagChecker<Fl extends string> =
    Fl extends ""
        ? string
	    : Fl extends `${Flag}${infer rest}`
            ? FlagChecker<rest>
	        : ReError<`Invalid flag used: ${Fl}`>

// deno-fmt-ignore
export type NamedCaptureGroup<Re extends string> =
    Re extends ""
	    ? {}
	    : Re extends `(?<${infer key}>${infer rest}` // `(?<{key}>{rest}`
	    	? rest extends `${infer _})${infer rest}` // `(?<{key}>{_}){rest'}`
	    		? rest extends `?${infer rest}` | `*${infer rest}` // `(?<{key}>{_})?{rest''}`
	    			? { [k in key]: string | undefined } & RegExCaptureResult<rest>
	    		    : { [k in key]: string } & RegExCaptureResult<rest>
                : never
            : Re extends `${infer _}(?<${infer rest}`
                ? RegExCaptureResult<`(?<${rest}`>
                : {}

// deno-fmt-ignore
export type RegExCaptureResult<Re extends string> =
    Re extends ""
        ? {}
        : Re extends `(?:${infer _})${infer rest}` // `(?:{_}){rest}`
            ? RegExCaptureResult<rest>
            : NamedCaptureGroup<Re>

export type RegExMatchResult<Re extends string> = {
	matched: boolean
	groups: RegExCaptureResult<Re> | undefined
	raw: RegExpExecArray | undefined
}

export type RegExMatchAllResult<Re extends string> = {
	groups: RegExCaptureResult<Re> | undefined
	raw: RegExpMatchArray
}[]

export type TypedRegEx<Re extends string, Flag extends string> = {
	regexString: Re
	flags?: FlagChecker<Flag> & Flag | undefined

	isMatch: (str: string) => boolean
	match: (str: string) => RegExMatchResult<Re>
	matchAll: (str: string) => RegExMatchAllResult<Re>
	captures: (str: string) => RegExCaptureResult<Re> | undefined
	captureAll: (str: string) => (RegExCaptureResult<Re> | undefined)[]
}

export const typedRegEx = <const Re extends string, const Flag extends string>(
	regexString: Re,
	flags?: FlagChecker<Flag> & Flag,
): TypedRegEx<Re, Flag> => {
	const regex = new RegExp(regexString, flags)

	const isMatch = (str: string): boolean => regex.test(str)

	const match = (str: string): RegExMatchResult<Re> => {
		const raw = regex.exec(str) ?? undefined

		return { matched: !!raw, groups: raw?.groups as any, raw }
	}

	const matchAll = (str: string): RegExMatchAllResult<Re> =>
		Array
			.from(str.matchAll(regex))
			.map((raw) => ({ groups: raw.groups as any, raw }))

	const captures = (str: string): RegExCaptureResult<Re> | undefined =>
		regex.exec(str)?.groups as any

	const captureAll = (str: string): (RegExCaptureResult<Re> | undefined)[] =>
		(matchAll(str) as any).map((r: any) => r.groups)

	return { regexString, flags, isMatch, match, matchAll, captures, captureAll } as const
}
