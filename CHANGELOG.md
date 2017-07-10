# 0.5.0-alpha.7 (2017-07-10)

- **[Feature]** Implement `BufferType`
- **[Fix]** `ArrayType#read` now uses `itemType.read` (instead of `.readTrusted`).
- **[Fix]** Do not type value for `readMatcher` and `readMatcher`, used by the general `UnionType`.

# 0.5.0-alpha.6

- **[Feature]** Implement `MapType`
- **[Internal]** Update build-tools to use TSLint 8

# 0.5.0-alpha.5

- **[Patch]** Export `TaggedUnionType`

# 0.5.0-alpha.4

- **[Feature]** Implement `LiteralType`
- **[Feature]** Implement `UnionType`
- **[Feature]** Implement `TaggedUnionType`. This is a subclass of UnionType to simplify
  the definition of unions of documents with a "tag property". The tag property acts as
  a discriminant and allows to retrieve the type of the whole document.
- **[Feature]** Add the `rename` option to `DocumentType`. This allows to rename
  the keys of the document similarly to the values of `SimpleEnumType`.
- **[Patch]** Fix the constraints for `SerializableType` generics.
  `Output` should extend `Input`. This restores the order `T`, `Format`,`Input`, `Output`.
- **[Internal]** Fix documentation generation with typedoc
- **[Internal]** Improve support for the tests checking the output of `.write`
- **[Internal]** Drop `lodash` dependency

# 0.5.0-alpha.3

- **[Feature]** Add support for the `"qs"` format for [the `qs` package][npm-qs] (used by [`express`][npm-express])
- **[Internal]** Create CHANGELOG.md

[npm-express]:https://www.npmjs.com/package/expess
[npm-qs]:https://www.npmjs.com/package/qs
