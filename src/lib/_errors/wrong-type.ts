import {Incident} from "incident";

// TODO(demurgos): Rename to InvalidTypeError ?
export namespace WrongTypeError {
  export type Name = "WrongType";
  export const name: Name = "WrongType";
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
  export type Type = Incident<Name, Data, Cause>;
  export function format({typeName, value, variableName}: Data): string {
    // TODO(demurgos): use utils.repr instead of stringifying value directly (because its type, `any`, is unsafe)
    if (typeof variableName === "string") {
      return `Expected type ${typeName} but received ${value} for ${variableName}`;
    } else {
      return `Expected type ${typeName} but received ${value}`;
    }
  }
  export function create(typeName: string, value: any, variableName?: string): Type {
    return Incident(name, {typeName, value, variableName}, format);
  }
}

export type WrongTypeError = WrongTypeError.Type;

export default WrongTypeError;
