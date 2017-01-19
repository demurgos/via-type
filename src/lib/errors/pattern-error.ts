import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `PatternError`.
 */
export interface PatternErrorData {
  string: string;
  pattern: RegExp;
}

/**
 * This error represents an unsatisfied pattern (regular expression).
 */
export class PatternError extends KryoError<PatternErrorData> {
  constructor(string: string, pattern: RegExp) {
    super(
      "pattern",
      {string: string, pattern: pattern},
      `Expected string to follow pattern ${pattern}`
    );
  }
}
