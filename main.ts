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

export class TypedRegExT<Re extends string> {
	private _regexString: Re
	private _flags: string

	private getRegex(): RegExp {
		return new RegExp(this._regexString, this._flags)
	}

	constructor(re: Re, flags: string = "") {
		this._regexString = re
		this._flags = flags
	}

	isMatch = (str: string): boolean => this.getRegex().test(str)

	match = (str: string): RegExMatchResult<Re> => {
		const raw = this.getRegex().exec(str) ?? undefined
		return {
			matched: !!raw,
			groups: raw?.groups as any,
			raw,
		}
	}

	matchAll = (str: string): RegExMatchAllResult<Re> => {
		const re = this.getRegex()
		return Array
			.from(str.matchAll(re))
			.map((raw) => ({ groups: raw.groups as any, raw }))
	}

	captures = (str: string): RegExCaptureResult<Re> | undefined => this.match(str).groups

	captureAll = (str: string): (RegExCaptureResult<Re> | undefined)[] =>
		(this.matchAll(str) as any).map((r: any) => r.groups)
}

export const TypedRegEx = <Re extends string, Fl extends string>(
	re: Re,
	flags?: FlagChecker<Fl> & Fl,
) => new TypedRegExT(re, flags)
