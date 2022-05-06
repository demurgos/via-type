import incident, { Incident } from "incident";
import objectInspect from "object-inspect";

export type Name = "InvalidType";
export const name: Name = "InvalidType";

export interface Data {
  /**
   * The expected Javascript type. This is one of the possible results of
   * the `typeof` operator.
   */
  typeName: string;

  /**
   * The value that has a problem with its type.
   */
  value: any;

  /**
   * The name of the variable that has a problem with its type.
   */
  variableName?: string;
}

export type Cause = undefined;
export type InvalidTypeError = Incident<Data, Name, Cause>;

export function format({typeName, value, variableName}: Data): string {
  if (typeof variableName === "string") {
    return `Variable \`${variableName}\` should have type \`${typeName}\`: ${objectInspect(value)}`;
  } else {
    return `Expected type \`${typeName}\`: ${objectInspect(value)}`;
  }
}

export function createInvalidTypeError(typeName: string, value: any, variableName?: string): InvalidTypeError {
  return incident.Incident(name, {typeName, value, variableName}, format);
}
