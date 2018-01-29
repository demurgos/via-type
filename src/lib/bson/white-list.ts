import { Incident } from "incident";
import { JSON_SERIALIZER } from "../json";
import { Serializer } from "../types";
import { name as typeName, WhiteListType } from "../types/white-list";

export function register(serializer: Serializer): void {
  function write<T>(type: WhiteListType<T>, val: T): any {
    return serializer.write(type.itemType, val);
  }

  function read<T>(type: WhiteListType<T>, input: any): T {
    const value: T = JSON_SERIALIZER.read(type.itemType, input);
    for (const allowed of type.values) {
      if (type.itemType.equals(value, allowed)) {
        return value;
      }
    }
    throw Incident("UnkownVariant", "Unknown variant");
  }

  function readTrusted<T>(type: WhiteListType<T>, input: string): string {
    return serializer.readTrusted(type.itemType, input);
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
