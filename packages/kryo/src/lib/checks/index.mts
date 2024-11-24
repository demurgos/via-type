import {AggregateCheck, formatAggregateCheck} from "./aggregate.mjs";
import {BaseTypeCheck, formatBaseTypeCheck} from "./base-type.mjs";
import {CheckKind} from "./check-kind.mjs";
import {CustomCheck, formatCustomCheck} from "./custom.mjs";
import {Float64Check, formatFloat64Check} from "./float64.mjs";
import {formatInstanceOfCheck, InstanceOfCheck} from "./instance-of.mjs";
import {formatLiteralTypeCheck, LiteralTypeCheck} from "./literal-type.mjs";
import {formatLiteralValueCheck, LiteralValueCheck} from "./literal-value.mjs";
import {formatLowerCaseCheck, LowerCaseCheck} from "./lower-case.mjs";
import {formatPropertyKeyCheck, PropertyKeyCheck} from "./property-key.mjs";
import {formatPropertyKeyFormatCheck, PropertyKeyFormatCheck} from "./property-key-format.mjs";
import {formatPropertyValueCheck, PropertyValueCheck} from "./property-value.mjs";
import {formatRangeCheck, RangeCheck} from "./range.mjs";
import {formatSizeCheck, SizeCheck} from "./size.mjs";
import {formatStringPatternCheck, StringPatternCheck} from "./string-pattern.mjs";
import {formatTrimmedCheck, TrimmedCheck} from "./trimmed.mjs";
import {formatUnicodeNormalizationCheck, UnicodeNormalizationCheck} from "./unicode-normalization.mjs";
import {formatUnionMatchCheck, UnionMatchCheck} from "./union-match.mjs";
import {formatUnionTagPresentCheck, UnionTagPresentCheck} from "./union-tag-present.mjs";
import {formatUnionTagValueCheck, UnionTagValueCheck} from "./union-tag-value.mjs";
import {formatUnixTimestampCheck, UnixTimestampCheck} from "./unix-timestamp.mjs";

export type Check =
  AggregateCheck
  | BaseTypeCheck
  | CustomCheck
  | Float64Check
  | InstanceOfCheck
  | LiteralTypeCheck
  | LiteralValueCheck
  | LowerCaseCheck
  | PropertyKeyCheck
  | PropertyKeyFormatCheck
  | PropertyValueCheck
  | RangeCheck
  | SizeCheck
  | StringPatternCheck
  | TrimmedCheck
  | UnicodeNormalizationCheck
  | UnionMatchCheck
  | UnionTagPresentCheck
  | UnionTagValueCheck
  | UnixTimestampCheck
  ;

export function format(check: Check) {
  switch (check.check) {
    case CheckKind.Aggregate: return formatAggregateCheck(check);
    case CheckKind.BaseType: return formatBaseTypeCheck(check);
    case CheckKind.Custom: return formatCustomCheck(check);
    case CheckKind.Float64: return formatFloat64Check(check);
    case CheckKind.InstanceOf: return formatInstanceOfCheck(check);
    case CheckKind.LiteralType: return formatLiteralTypeCheck();
    case CheckKind.LiteralValue: return formatLiteralValueCheck();
    case CheckKind.LowerCase: return formatLowerCaseCheck();
    case CheckKind.PropertyKey: return formatPropertyKeyCheck();
    case CheckKind.PropertyKeyFormat: return formatPropertyKeyFormatCheck();
    case CheckKind.PropertyValue: return formatPropertyValueCheck();
    case CheckKind.Range: return formatRangeCheck(check);
    case CheckKind.Size: return formatSizeCheck(check);
    case CheckKind.StringPattern: return formatStringPatternCheck();
    case CheckKind.Trimmed: return formatTrimmedCheck();
    case CheckKind.UnicodeNormalization: return formatUnicodeNormalizationCheck(check);
    case CheckKind.UnionMatch: return formatUnionMatchCheck();
    case CheckKind.UnionTagPresent: return formatUnionTagPresentCheck(check);
    case CheckKind.UnionTagValue: return formatUnionTagValueCheck(check);
    case CheckKind.UnixTimestamp: return formatUnixTimestampCheck();
    default:
      throw new Error("unexpected check kind");
  }
}
