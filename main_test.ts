import { TypedRegEx } from "./main.ts"
import { assertEquals } from "./test_deps.ts"

Deno.test("#captures", async (t) => {
	await t.step("should extract year/month/day groups", () => {
		const r = TypedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$")
		const result = r.captures("2020-12-02")

		assertEquals(result, { year: "2020", month: "12", day: "02" })
	})

	await t.step("should extract optional groups", () => {
		const r = TypedRegEx("foo(?<name>.*)?")
		const result = r.captures("hello worldfoobar")
		assertEquals(result, { name: "bar" })

		// no match case
		assertEquals(r.captures("hello world")?.name, undefined)
	})

	await t.step("should extract 0 or more (*) applied on capture groups", () => {
		const r = TypedRegEx("^foo(?<name>\\w)*", "gi")
		const result = r.captures("foobar")

		assertEquals(result, { name: "r" })
	})
})

Deno.test("#captureAll", async (t) => {
	const namesRegex = TypedRegEx(
		"((?<firstName>\\w+) (?<middleName>\\w+)? (?<lastName>\\w+))+",
		"g",
	)

	await t.step("should capture all names in string", () => {
		const result = namesRegex.captureAll("Joe  Mama,Ligma  Bolz,Sir Prysing Lee")

		assertEquals(result, [
			{ firstName: "Joe", middleName: undefined, lastName: "Mama" },
			{ firstName: "Ligma", middleName: undefined, lastName: "Bolz" },
			{ firstName: "Sir", middleName: "Prysing", lastName: "Lee" },
		])
	})

	await t.step("should return empty array if no matches", () => {
		// no match
		assertEquals(namesRegex.captureAll("932408239"), [])

		// empty string
		assertEquals(namesRegex.captureAll(""), [])
	})
})

Deno.test("#match", async (t) => {
	const dataRegex = TypedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$")

	await t.step("should extract year/month/day groups", () => {
		const result = dataRegex.match("2020-12-02")

		assertEquals({ ...result, raw: [...result.raw!] }, {
			matched: true,
			raw: ["2020-12-02", "2020", "12", "02"],
			groups: {
				year: "2020",
				month: "12",
				day: "02",
			},
		})
	})

	await t.step("should return matched: false if string doesnt match pattern", () => {
		const result = dataRegex.match("2020-12")

		assertEquals(result.matched, false)
	})
})

Deno.test("#matchAll", async (t) => {
	const namesRegex = TypedRegEx(
		"((?<firstName>\\w+) (?<middleName>\\w+)? (?<lastName>\\w+))+",
		"g",
	)

	await t.step("should capture all names in string", () => {
		const result = namesRegex.matchAll("Joe  Mama,Ligma  Bolz,Sir Prysing Lee")

		// skips raw value testing
		assertEquals(result.map(({ groups }) => groups), [
			{ firstName: "Joe", middleName: undefined, lastName: "Mama" },
			{ firstName: "Ligma", middleName: undefined, lastName: "Bolz" },
			{ firstName: "Sir", middleName: "Prysing", lastName: "Lee" },
		])
	})

	await t.step("should return empty array if no matches", () => {
		// no match
		assertEquals(namesRegex.matchAll("932408239"), [])

		// empty string
		assertEquals(namesRegex.matchAll(""), [])
	})
})

Deno.test("#isMatch", async (t) => {
	await t.step("should check if pattern matches year/month/day", () => {
		const r = TypedRegEx("^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$")

		assertEquals(r.isMatch("2020-12-02"), true)
		assertEquals(r.isMatch("2020-12"), false)
	})
})

Deno.test("flags", async (t) => {
	await t.step("should allow all allowed flags", () => {
		TypedRegEx("^foo(?<name>\\w)*", "gimsuy") // `d` unused as it throws a runtime error
	})
})

Deno.test("bugs", async (t) => {
	await t.step("should not yield ts type error on using non-capturing groups", () => {
		// https://github.com/phenax/typed-regex/issues/1
		const r = TypedRegEx("^foo(?:\\w)(?<name>.*)$")
		const result = r.captures("foobar")

		assertEquals(result?.name, "ar")
	})
})

Deno.test("non capturing groups", async (t) => {
	await t.step("should not capture non-capturing groups", () => {
		const r = TypedRegEx("^(?:foo)$")
		const result = r.captures("foo")

		assertEquals(result, undefined)
	})
})
