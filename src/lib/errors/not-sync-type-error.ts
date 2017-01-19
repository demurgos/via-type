import {Type} from "../interfaces";
import {KryoError} from "./kryo-error";

/**
 * Interface for the `.data` property of `NotSyncError`.
 */
export interface NotSyncErrorData {
  type: Type<any>;
  methodName: string;
}

export class NotSyncError extends KryoError<NotSyncErrorData> {
  constructor(type: Type<any>, methodName: string) {
    super(
      "not-sync",
      {type: type, methodName: methodName},
      `The type ${type.type} does not support synchronous methods.`
    );
  }
}
