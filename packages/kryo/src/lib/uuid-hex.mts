/**
 * @module kryo/uuid-hex
 */

import { Ucs2StringType } from "./ucs2-string.mjs";

/**
 * Semantic alias for strings representing UUID.
 */
export type UuidHex = string;

/**
 * Type for UUID hex string standard representation.
 */
export const $UuidHex: Ucs2StringType = new Ucs2StringType({
  lowerCase: true,
  trimmed: true,
  minLength: 36,
  maxLength: 36,
  pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
});
