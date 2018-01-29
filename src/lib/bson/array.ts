import { createInvalidArrayItemsError } from "../errors/invalid-array-items";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createMaxArrayLengthError } from "../errors/max-array-length";
import { Serializer } from "../types";
import { ArrayType, name as typeName } from "../types/array";

export function register(serializer: Serializer): void {
  function write<T>(type: ArrayType<T>, val: T[]): any[] {
    return val.map((item: T): any => serializer.write(type.itemType, item));
  }

  function read<T>(type: ArrayType<T>, input: any[]): T[] {
    if (!Array.isArray(input)) {
      throw createInvalidTypeError("array", input);
    }
    if (type.maxLength !== undefined && input.length > type.maxLength) {
      throw createMaxArrayLengthError(input, type.maxLength);
    }
    let invalid: undefined | Map<number, Error> = undefined;
    const result: T[] = [];
    const itemCount: number = input.length;
    for (let i: number = 0; i < itemCount; i++) {
      try {
        const item: T = serializer.read(type.itemType, input[i]);
        if (invalid === undefined) {
          result.push(item);
        }
      } catch (err) {
        if (invalid === undefined) {
          invalid = new Map();
        }
        invalid.set(i, err);
      }
    }
    if (invalid !== undefined) {
      throw createInvalidArrayItemsError(invalid);
    }
    return result;
  }

  function readTrusted<T>(type: ArrayType<T>, input: any[]): T[] {
    return input.map((item: any): T => serializer.readTrusted(type.itemType, item));
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
