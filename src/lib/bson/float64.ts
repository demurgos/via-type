import { Serializer, TypeSerializer } from "../types";
import { Float64Type, name as typeName } from "../types/float64";

function write(type: Float64Type, value: number): number {
  return value;
}

function read(type: Float64Type, input: number): number {
  const error: Error | undefined = type.testError(input);
  if (error !== undefined) {
    throw error;
  }
  return input;
}

function readTrusted(type: Float64Type, input: number): number {
  return input;
}

export const SERIALIZER: TypeSerializer<any> = {
  typeName,
  write,
  read,
  readTrusted,
};

export function register(serializer: Serializer): void {
  serializer.register(SERIALIZER);
}
