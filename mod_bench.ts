import { TypedRegEx as TypedRegExOld } from "https://raw.githubusercontent.com/phenax/typed-regex/e98cebaeeea58d7a61bc6aa12243459484870c08/src/index.ts"
import { typedRegEx } from "./mod.ts"
import { assertEquals } from "./test_deps.ts"

const pattern = "((?<firstName>\\w+) (?<middleName>\\w+)? (?<lastName>\\w+))+"
const flag = "g"

const input = "Joe  Mama,Ligma  Bolz,Sir Prysing Lee"
const expected: { firstName: string; middleName: string | undefined; lastName: string }[] = [
	{ firstName: "Joe", middleName: undefined, lastName: "Mama" },
	{ firstName: "Ligma", middleName: undefined, lastName: "Bolz" },
	{ firstName: "Sir", middleName: "Prysing", lastName: "Lee" },
]

const baseRegex = new RegExp(pattern, flag)
const oldRegex = TypedRegExOld(pattern, flag)
const newRegex = typedRegEx(pattern, flag)

Deno.bench({
	name: "Regular RegExp",
	group: "matchAll",
	sanitizeExit: false,
	fn: () => {
		const result = Array.from(input.matchAll(baseRegex), (raw) => ({ groups: raw.groups, raw }))

		// @ts-expect-error: undefined values
		assertEquals(result.map(({ groups }) => groups), expected)
	},
})

Deno.bench({
	name: "TypedRegEx (old)",
	group: "matchAll",
	sanitizeExit: false,
	fn: () => {
		const result = oldRegex.matchAll(input)

		// @ts-expect-error: exactOptionalPropertyTypes
		assertEquals(result.map(({ groups }) => groups), expected)
	},
})

Deno.bench({
	name: "TypedRegEx (new)",
	group: "matchAll",
	sanitizeExit: false,
	baseline: true,
	fn: () => {
		const result = newRegex.matchAll(input)

		assertEquals(result.map(({ groups }) => groups), expected)
	},
})
