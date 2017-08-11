import {Incident} from "incident";
import {Type as KryoType} from "../_interfaces";

export namespace NotSyncTypeError {
  export type Name = "NotSyncType";
  export const name: Name = "NotSyncType";
  export interface Data {
    type: KryoType<any>;
    methodName: string;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({type, methodName}: Data): string {
    return `The method ${methodName} of the type ${type}) is not supported`;
  }
  export function create(type: KryoType<any>, methodName: string): Type {
    return new Incident(name, {type, methodName}, format);
  }
}

export type NotSyncTypeError = NotSyncTypeError.Type;

export default NotSyncTypeError;
