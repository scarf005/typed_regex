// deno-lint-ignore-file no-explicit-any
import type {
	FlagChecker,
	RegExCaptureResult,
	RegExMatchAllResult,
	RegExMatchResult,
} from "./type_parser.ts"
import type { TypedRegEx } from "./api_types.ts"

/**
 * Type-safe regular expressions matcher.
 *
 * @param regexString Regular expression as a string literal. (example: `(?<name>\\w+)`)
 *
 * @param flags [RegExp flags][flags] as a string literal.
 * Invalid flag characters will result in a compile-time error. (example: `gmi`)
 *
 * [flags]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#advanced_searching_with_flags
 *
 * @example
 * ```ts
 * import { typedRegEx } from "https://deno.land/x/typed_regex@$MODULE_VERSION/mod.ts"
 * import { assertType, IsExact } from "https://deno.land/std@0.216.0/testing/types.ts"
 *
 * const regex = typedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$", "g")
 * const result = regex.captures("2020-12-02")
 *
 * assertType<IsExact<typeof result, Result>>(true)
 *
 * type Result = { year: string; month: string; day: string } | undefined
 * ```
 */
export const typedRegEx = <const Re extends string, const Flag extends string>(
	regexString: Re,
	flags?: FlagChecker<Flag> & Flag,
): TypedRegEx<Re, Flag> => {
	const regex = new RegExp(regexString, flags)

	const isMatch = (str: string): boolean => regex.test(str)

	const match = (str: string): RegExMatchResult<Re> => {
		const raw = regex.exec(str) ?? undefined

		return raw ? { matched: true, groups: raw.groups as any, raw } : { matched: false }
	}

	const matchAll = (str: string): RegExMatchAllResult<Re> =>
		Array.from(str.matchAll(regex), (raw) => ({ groups: raw.groups as any, raw }))

	const captures = (str: string): RegExCaptureResult<Re> | undefined =>
		regex.exec(str)?.groups as any

	const captureAll = (str: string): (RegExCaptureResult<Re> | undefined)[] =>
		(matchAll(str) as any).map((r: any) => r.groups)

	return { regexString, flags, isMatch, match, matchAll, captures, captureAll } as any
}
