import { Incident } from "incident";
import objectInspect from "object-inspect";

export type Name = "LazyOptions";
export const name: Name = "LazyOptions";

export interface Data {
  target: any;
}

export type Cause = undefined;
export type LazyOptionsError = Incident<Data, Name, Cause>;

export function createLazyOptionsError(target: any): LazyOptionsError {
  return new Incident(name, {target}, ({target}) => `Cannot resolve lazy options in target: ${objectInspect(target)}`);
}
