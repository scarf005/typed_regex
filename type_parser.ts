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
