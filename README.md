# Kryo

[![npm](https://img.shields.io/npm/v/kryo.svg?maxAge=2592000)](https://www.npmjs.com/package/kryo)
[![GitHub repository](https://img.shields.io/badge/Github-demurgos%2Fkryo-blue.svg)](https://github.com/demurgos/kryo)
[![Build status](https://img.shields.io/travis/demurgos/kryo/master.svg?maxAge=2592000)](https://travis-ci.org/demurgos/kryo)
[![Codecov](https://codecov.io/gh/demurgos/kryo/branch/master/graph/badge.svg)](https://codecov.io/gh/demurgos/kryo)
[![Greenkeeper badge](https://badges.greenkeeper.io/demurgos/kryo.svg)](https://greenkeeper.io/)

[Documentation](https://demurgos.github.io/kryo/)

## Installation

_Kryo_ allows to declaratively define types and schemas to test and serialize data.
While Typescript provides compile-time checks, _Kryo_ is intended for runtime verification, even against
untrusted input.

Install _Kryo_ from _npm_:

```shell
npm install --save kryo
```

Note that the `master` branch is continuously deployed to _npm_ with the `next` tag. You can use it to install
the next version without waiting for the release.

```shell
npm isntall --save kryp@next
```

## Getting started

### Types

Kryo differentiates three level of types.
- The simplest types only guarantee support for runtime values: test if the value match the type, clone values,
  perform equality tests.
- Serializable types extend simple types by adding support for conversions between the runtime and serializable
  representation of values of the provided type. The currently supported formats are JSON, BSON and query strings
  (as parsed by the `qs` library).
- Versioned types further extend serializable types by adding support for comparison between multiple values
  of the type to produce diffs. These diffs can then be used to convert one value to the other.

You can import all the types from the main module, but it is recommended to import them them directly from
their module (to allow better dead-code elimination):

```typescript
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { DateType } from "kryo/types/date";

// Use the type constructor to create a specialized string
const $Identifier: Ucs2StringType = new Ucs2StringType({minLength: 1, maxLength: Infinity, pattern: /[_a-zA-Z][_a-zA-Z0-9]/});
// Instantiate the date type, see next section to use a builtin instead of creating a new instance
const $Date: DateType = new DateType();

// Both $identifier and $date are versioned type: they implement the methods of all the levels.

// Use the methods provided by simple type 
$Identifier.test("abc"); // true
$Identifier.test("$#!+"); // false
$Date.testError(NaN); 
const now: Date = new Date();
const nowCopy = $Date.clone(now);
console.log(now === nowCopy); // false: `clone` performs a deep copy on objects
$Date.equals(now, nowCopy); // Tests the "equivalence" of the values: it's not the same object but they hold the same value

// Use the methods provided by serializable types
$Date.write("json", now); // Returns the ISO string "2017-10-15T17:10:08.218Z"
$Date.read("json", "2017-10-15T17:10:08.218Z"); // Returns a `Date` instance
$Identifier.read("json", "$#!+"); // Throws error: you can use Kryo to read untrusted input and validate it
$Date.readTrusted("json", "2017-10-15T17:10:08.218Z"); // If you know what you are doing, you can only perform conversion and ignore validation

// Use the methods provided by versionned types
const diff1: number | undefined = $Date.diff(now, nowCopy); // undefined: both are equal
const diff2: number | undefined = $Date.diff(new Date(10), new Date(30)); // 20: the diff of `DateType` is the difference in ms
const diff3: number | undefined = $Date.diff(new Date(30), new Date(60)); // 30
const diff4: [string, string] | undefined = $Identifier.diff("foo", "bar"); // ["foo", "bar"], strings return a simple [old, new] tuple
$Date.patch(new Date(10), diff2); // applies the diff: returns a value equivalent to `new Date(30)`
$Date.squash(diff2, diff3); // 50: merge the two diffs in a single diff representing the whole change
$Date.reverseDiff(diff3); // -30: Diffs are symetric: you can always reverse them
$Date.patch($Date.reverseDiff(diff3)); // 30: Apply the reverse diff to retrieve `30` from `60`
```

### Type constructors and builtins

Kryo provides both constructors to let you instantiate types by providing a minimal configuration but also builtins
for common types. By convention, the names of actual types start with `$` while the names of type constructors end
with `Type`.

Example: Kryo provides the class `IntegerType` to produce types for integers in a given range. Kryo also provide
the built-in `$Uint32` type: an instance of `IntegerType` already configured for the common range of unsigned
32-bit integers (`[0, 2**32 - 1]`).

```typescript
import { IntegerType } from "kryo/types/integer";
import { $Uint32 } from "kryo/builtins/uint32";

/** Represents the type of the outcome of throwing two D6 dices and summing their value */
const $twoDicesOutcome: Type<number> = new IntegerType({min: 2, max: 36});
$twoDicesOutcome.test(6); // true
$twoDicesOutcome.test("three"); // false
$twoDicesOutcome.test(NaN); // false
$twoDicesOutcome.test(1); // false

// You can directly use `$Uint32`, no need to configure / instantiate it:
$Uint32.test(1); // true
$Uint32.test(1.5); // false
$Uint32.test(2 ** 32); // false
$Uint32.test(2 ** 32 - 1); // true
```

### Types

Kryo currently provide support for the following types:

- Null: Represents the single the value `null`
- Boolean: `true` or `false`
- Integer: Integers in a given range
- Float: Finite or infinite floats
- Date: Point in times
- Buffer: Arrays of bytes
- Ucs2String: Javascript strings of UCS2 code units, with patterns, case folding, length checks, ...
- CodepointString: Strings of unicode codepoints, with normalization, support for surrogate pairs and unicode-aware
  patterns, length checks, etc.
- Json: Opaque value safe with regard to JSON serialization and deserialization.
- Enum: Represents Typescript enums
- Literal type: Represents a single value, useful for unions.
- Union: Represents sum types to support multiple alternatives (ex. "integer or string"). Multiple implementations
  are provided, mainly to better deal with deserialization and errors: whitelists, try-unions, tagged unions.
- Array: Ordered collection of items
- Map: Unbounded collection of same-type (key, value) pairs
- Document: Finite collection of mixed values identified by their string key.

It is also fully compatible with your own type if you implement the correct interface.

Please check the documentation of each type to see that options are available and which builtins are provided
out of the box.

Here is an example to define the type of a point in a RGBa color-space with 8-bit depth:

```typescript
import {$Uint8} from "kryo/integer";

```

### Circular definitions, lazy options

Kryo supports circular type definitions, this allows to describe recursive values such as trees.
Note that circular values are not supported (yet) by Kryo: you have to break and recreate the cycles in the values yourself.

Here is an example of values with a recursive structure:
```typescript
const v0 = {}
const v1 = {foo: {}}
const v2 = {foo: {bar: {}}}
const v3 = {foo: {bar: {foo: {}}}}
const v4 = {foo: {bar: {foo: {bar: {}}}}}
```

At each level, the value is a document with an optional key alternating between `foo` and `bar`.
The value is not circular, but we see that to describe it we need the types to be self-referential.

A simple (invalid) approach would be to define it as follow:
```typescript
// The document at each even level can have an optional key `foo` of type `$oddLevel`
const $evenLevel = new DocumentType({
  properties: {
    foo: {type: $oddLevel, optional: true},
  }
});

// This is the corresponding type for the documents at an odd depth
const $oddLevel = new DocumentType({
  properties: {
    bar: {type: $evenLevel, optional: true},
  }
});

$evenLevel.test(v4); // Error
```

The issue with the code above is that during the declaration of `$evenLevel`, `$oddLevel` is not yet defined so the
received properties object is `{foo: {type: undefined, optional: true}}`.
To solve this problem, Kryo's types use a simple trick: you can pass the options lazily. Instead of providing
the options object directly, you can use a function returning this function object. This function will be called
only once, but not at the creation of the instance but at its first use.

```typescript
// Note that the options were wrapped in a lambda
const $evenLevel = new DocumentType(() => ({
  properties: {
    foo: {type: $oddLevel, optional: true},
  }
}));

const $oddLevel = new DocumentType(() => ({
  properties: {
    bar: {type: $evenLevel, optional: true},
  }
}));

// At this point, both `$evenLevel` and `$oddLevel` is defined but none of the lambda were called
// because the types were not used: there were no attribute read or method call.

// When call a method for the first time, `$evenLevel` initializes itself by calling the lambda
// When testing `v4`, `$oddLevel` will also be used so it will be initialized at this point.
$evenLevel.test(v4); // Success: returns `true`
```

## License

[MIT License](./LICENSE.md)
