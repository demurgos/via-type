import { createInvalidValueError } from "../errors/invalid-value.js";
import { Type } from "../index.js";

/**
 * Calls the `.testError` method of `type` or falls back to an implementation derived from `.test`.
 *
 * @param type The type used for the test.
 * @param value The value to match.
 * @return Undefined if the value matches, otherwise an `Error` instance.
 */
export function testError<T>(type: Type<T>, value: unknown): Error | undefined {
  if (type.testError !== undefined) {
    return type.testError(value);
  } else {
    return type.test(value) ? undefined : createInvalidValueError(type, value);
  }
}
