// deno-lint-ignore-file no-explicit-any ban-types
// TODO: (bug) nested * is not set as optional
// TODO: Create some parse errors in invalid cases
// TODO: Parse normal captures in a typed tuple?

export type ReError<T extends string> = { type: T }

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

	/**
	 * Check if a string matches regex
	 * (Equivalent to [`RegExp#test`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test)).
	 *
	 * ## Example
	 *
	 * ```ts
	 * const r = typedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$")
	 *
	 * assertEquals(r.isMatch("2020-12-02"), true)
	 * assertEquals(r.isMatch("2020-12"), false)
	 * ```
	 */
	isMatch: (str: string) => boolean

	/**
	 * Equivalent to calling [`RegExp#exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) once.
	 *
	 * ## Example
	 *
	 * ```ts
	 * const dataRegex = typedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$")
	 * const result = dataRegex.match("2020-12-02")
	 *
	 * assertEquals({ ...result, raw: [...result.raw!] }, {
	 * 	matched: true,
	 * 	raw: ["2020-12-02", "2020", "12", "02"],
	 * 	groups: {
	 * 		year: "2020",
	 * 		month: "12",
	 * 		day: "02",
	 * 	},
	 * })
	 * ```
	 *
	 * @return the matched result with typed capture groups of type {@link RegExMatchResult}.
	 */
	match: (str: string) => RegExMatchResult<Re>

	/**
	 * Equivalent to [`String#matchAll`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll). Returns a list of matched results with typed capture groups.
	 *
	 * ## Example
	 *
	 * ```ts
	 * const namesRegex = typedRegEx(
	 * 	"((?<firstName>\\w+) (?<middleName>\\w+)? (?<lastName>\\w+))+",
	 * 	"g",
	 * )
	 *
	 * const result = namesRegex.matchAll("Joe  Mama,Ligma  Bolz,Sir Prysing Lee")
	 *
	 * // skips raw value testing
	 * assertEquals(result.map(({ groups }) => groups), [
	 * 	{ firstName: "Joe", middleName: undefined, lastName: "Mama" },
	 * 	{ firstName: "Ligma", middleName: undefined, lastName: "Bolz" },
	 * 	{ firstName: "Sir", middleName: "Prysing", lastName: "Lee" },
	 * ])
	 * ```
	 *
	 * @returns the an array of matched result with typed capture groups of type {@link RegExMatchAllResult}.
	 */
	matchAll: (str: string) => RegExMatchAllResult<Re>

	/**
	 * Extract the typed capture groups from the regular expression.
	 *
	 * ## Example
	 *
	 * ```ts
	 * const regex = typedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$", "g")
	 * const result = regex.captures("2020-12-02")
	 *
	 * result //=> { year: string, month: string, day: string } | undefined
	 * ```
	 *
	 * @return capture groups of type {@link RegExCaptureResult}
	 */
	captures: (str: string) => RegExCaptureResult<Re> | undefined

	/**
	 * Extract all the capture groups from the regular expression as an array of typed results.
	 *
	 * ## Example
	 *
	 * ```ts
	 * const namesRegex = typedRegEx(
	 *   "((?<firstName>\\w+) (?<middleName>\\w+)? (?<lastName>\\w+))+",
	 *   "g",
	 * )
	 * const result = namesRegex.captureAll("Joe  Mama,Ligma  Bolz,Sir Prysing Lee")
	 * assertEquals(result, [
	 *   { firstName: "Joe", middleName: undefined, lastName: "Mama" },
	 *   { firstName: "Ligma", middleName: undefined, lastName: "Bolz" },
	 *   { firstName: "Sir", middleName: "Prysing", lastName: "Lee" },
	 * ])
	 * ```
	 *
	 * @return an array of typed capture groups.
	 */
	captureAll: (str: string) => (RegExCaptureResult<Re> | undefined)[]
}

/**
 * Type-safe regular expressions matcher.
 *
 * @param regexString Regular expression as a string literal.
 *                    The capture groups in the regex are used to construct the type.
 *                    (example: `(?<name>\\w+)`)
 *
 * @param flags [RegExp flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags)
 *              as a string literal. The flags are type checked so any invalid flag characters will result in a typescript error.
 *              (example: `gmi`)
 */
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
