import type {
	FlagChecker,
	RegExCaptureResult,
	RegExMatchAllResult,
	RegExMatchResult,
} from "./type_parser.ts"

export type TypedRegEx<Re extends string, Flag extends string> = {
	regexString: Re
	flags?: (FlagChecker<Flag> & Flag) | undefined

	/**
	 * Check if a string matches regex (Equivalent to [`RegExp#test`][test]).
	 *
	 * [test]: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test>
	 *
	 * @example
	 * ```ts
	 * const r = typedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$")
	 *
	 * assertEquals(r.isMatch("2020-12-02"), true)
	 * assertEquals(r.isMatch("2020-12"), false)
	 * ```
	 */
	isMatch: (str: string) => boolean

	/**
	 * Equivalent to calling [`RegExp#exec`][exec] once.
	 *
	 * [exec]: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec>
	 *
	 * @example
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
	 * Equivalent to [`String#matchAll`][matchAll]. Returns a list of matched results with typed capture groups.
	 *
	 * [matchAll]: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll>
	 *
	 * @example
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
	 * @example
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
	 * @example
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
	 * @return an array of {@link RegExCaptureResult}
	 */
	captureAll: (str: string) => (RegExCaptureResult<Re> | undefined)[]
}
