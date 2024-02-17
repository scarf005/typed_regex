// deno-lint-ignore-file ban-types
export type ReError<T extends string> = { type: T }

/**
 * [Valid RegExp flags][flags].
 *
 * [flags]: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp>
 */
export type Flag = "d" | "g" | "i" | "m" | "s" | "u" | "y"

// deno-fmt-ignore
export type FlagChecker<Fl extends string> =
	Fl extends ""
		? string
		: Fl extends `${Flag}${infer rest}`
			? FlagChecker<rest>
			: ReError<`Invalid flag used: ${Fl}`>

// deno-fmt-ignore
type NamedCaptureGroupInner<Re extends string> =
	Re extends ""
		? {}
		: Re extends `(?<${infer key}>${infer rest}` // `(?<{key}>{rest}`
			? rest extends `${infer _})${infer rest}` // `(?<{key}>{_}){rest'}`
				? rest extends `?${infer rest}` | `*${infer rest}` // `(?<{key}>{_})?{rest''}`
					? { [k in key]: string | undefined } & RegExCaptureResultInner<rest>
					: { [k in key]: string } & RegExCaptureResultInner<rest>
				: never
			: Re extends `${infer _}(?<${infer rest}`
				? RegExCaptureResultInner<`(?<${rest}`>
				: {}

// deno-fmt-ignore
type RegExCaptureResultInner<Re extends string> =
	Re extends ""
		? {}
		: Re extends `(?:${infer _})${infer rest}` // `(?:{_}){rest}`
			? RegExCaptureResultInner<rest>
			: NamedCaptureGroupInner<Re>

export type NamedCaptureGroup<Re extends string> = Id<NamedCaptureGroupInner<Re>>
export type RegExCaptureResult<Re extends string> = Id<RegExCaptureResultInner<Re>>

// https://old.reddit.com/r/typescript/comments/lknqyz/tool_to_normalize_types_specifically_intersections/
export type Id<T> = T extends object ? { [P in keyof T]: Id<T[P]> } : T

export type RegExMatchResult<Re extends string> =
	| { matched: false }
	| { matched: true; groups: RegExCaptureResult<Re>; raw: RegExpExecArray }

export type RegExMatchAllResult<Re extends string> = {
	groups: RegExCaptureResult<Re> | undefined
	raw: RegExpMatchArray
}[]
