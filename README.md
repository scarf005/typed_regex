# typed_regex

[![deno module](https://shield.deno.dev/x/typed_regex)](https://deno.land/x/typed_regex) [![Tests](https://github.com/scarf005/typed_regex/actions/workflows/test.yml/badge.svg)](https://github.com/scarf005/typed_regex/actions/workflows/test.yml)

type-safe regular expression parser for [named capture groups][named-capture-groups].

## Features

- Zero dependency
- Written fully in TypeScript
- Ported to deno from [@phenax/typed-regex][repo]

## Usage

The type of the result object is infered from the regular expression.

```ts
import { typedRegEx } from "https://deno.land/x/typed_regex@$MODULE_VERSION/mod.ts"

const regex = typedRegEx(
	"^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$",
	"g",
)
const result = regex.captures("2020-12-02")

result //=> { year: string, month: string, day: string } | undefined
```

> NOTE: The regular expression has to be a string literal for the types to be valid

### Optional properties

If the capture group is marked as optional in the regular expression, the generated type will reflect that

```ts
import { typedRegEx } from "https://deno.land/x/typed_regex@$MODULE_VERSION/mod.ts"

const regex = typedRegEx("(?<first>\\d+)/(?<second>\\w+)?", "g")
const result = regex.captures("1234/foobar")

result //=> { first: string, second: string | undefined } | undefined
```

### Non Capturing groups

If the capture group is marked as [non-capturing][non-capturing] in the regular expression, the generated type will ignore it

```ts
const r = typedRegEx("^(?:foo)$")
const result = r.captures("foo")

result //=> {} | undefined
```

## Browser support

Most modern browsers support named capture groups. For details, check [these browsers][can-i-use]

## Changes from original library

### Breaking Changes

names changed to

- `TypedRegex` -> `typedRegex` (since it's no longer a class but a function)
- `TypedRegexT` -> `TypedRegex` (since it's no longer a class but a type)

### Internal Changes

- `getRegex()` is now a cached variable instead of a method.
- `RegExp` is now a closure instead of class.

[named-capture-groups]: https://github.com/tc39/proposal-regexp-named-groups
[repo]: https://github.com/phenax/typed-regex
[non-capturing]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Non-capturing_group
[can-i-use]: https://caniuse.com/mdn-javascript_regular_expressions_named_capturing_group

## License

Typed_Regex is licensed under [MIT](./LICENSE)
