import {Incident} from "incident";

/**
 * Interface for the `.data` property of `IncidentTypeError`.
 */
export interface UnexpectedTypeErrorData {
  /**
   * The expected Javascript type. This is one of the possible results of
   * the `typeof` operator.
   */
  expectedType: "array" | "boolean" | "date" | "number" | "string";

  /**
   * The name of the function where the IncidentTypeError was detected.
   */
  functionName?: string;

  /**
   * The name of the variable that has a problem with its type.
   */
  variableName?: string;

  /**
   * The value that has a problem with its type.
   */
  value: any;
}

/**
 * This is an Incident version of `TypeError`.
 */
export class IncidentTypeError extends Incident<UnexpectedTypeErrorData> {
  constructor(expectedType: "array" | "boolean" | "date" | "number" | "string", value: any) {
    super(
      "incident-type",
      {expectedType: expectedType, value: value},
      `Expected type ${expectedType}, received ${typeof value}`
    );
  }
}
