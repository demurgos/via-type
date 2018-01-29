import { Incident } from "incident";
import { createNotImplementedError } from "../errors/not-implemented";
import { JsonSerializer, Lazy, Serializer, Type } from "../types";
import { DocumentType } from "./document";
import { LiteralType } from "./literal";
import { SimpleEnumType } from "./simple-enum";
import * as union from "./union";

export type Name = "tagged-union";
export const name: Name = "tagged-union";
export namespace json {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }

  export type Type = undefined;
}
export type Diff = any;

export interface TaggedUnionOptions<T extends {}> {
  variants: DocumentType<T>[];
  tag: keyof T;
}

function getTagValuesWithBaseType<T extends {}>(
  options: TaggedUnionOptions<T>,
): [Map<number | string, DocumentType<T>>, JsonSerializer<any, any, any>] {
  const tagName: keyof T = options.tag;
  let tagBaseType: JsonSerializer<any, any, any> | undefined = undefined;
  const tagValuesMap: Map<number | string, DocumentType<T>> = new Map();
  for (const variant of options.variants) {
    if (variant === undefined) {
      // tslint:disable-next-line:max-line-length
      throw new Incident("UndefinedVariant", {variants: options.variants}, "The supplied TaggedUnion options contain undefined variants. If you have circular dependencies, try to use lazy options.");
    }

    if (!(tagName in variant.properties)) {
      throw new Incident("TagNotFound", "Tag not found in variant of tagged union");
    }
    if (!(variant.properties[tagName].type instanceof LiteralType)) {
      throw new Incident("NonLiteralTag", "Tag property must be a literal type");
    }
    const curTag: LiteralType<any> = variant.properties[tagName].type as LiteralType<any>;
    if (tagBaseType === undefined) {
      // TODO: Use type name instead of instanceof
      if (curTag.type instanceof SimpleEnumType) {
        tagBaseType = curTag.type;
      } else {
        throw new Incident("InvalidTagBaseType", "The base type of a tag property must be a simple enum");
      }
    } else if (curTag.type !== tagBaseType) {
      throw new Incident("MixedTagBaseType", "All the variants of a tag property must have the same base type");
    }
    if (!(typeof curTag.value === "number" || typeof curTag.value === "string")) {
      throw new Incident("InvalidTagValue", "The value of a tag property must be a number or string");
    }
    const value: number | string = curTag.value;
    if (tagValuesMap.has(value)) {
      throw new Incident("DuplicateTagValue", "The tag values must be unique");
    }
    tagValuesMap.set(value, variant);
  }
  if (tagBaseType === undefined) {
    throw new Incident("NoVariants");
  }
  return [tagValuesMap, tagBaseType!];
}

/**
 * Create a map from the serialized label to the corresponding type variant
 *
 * @param tagName Name of the tag property
 * @param variants Type variants for this union, these should all be tagged document types
 * @param tagBaseType The underlying type of all the variants (must be a simple enum currently)
 * @param serializer The serializer to use to create the map
 * @return Map from the serialized label to the corresponding type variant.
 */
function createOutValuesMap<T extends {}>(
  tagName: keyof T,
  variants: DocumentType<T>[],
  tagBaseType: any,
  serializer: Serializer,
): Map<number | string, DocumentType<T>> {
  const result: Map<number | string, DocumentType<T>> = new Map();
  for (const variant of variants) {
    const curTag: LiteralType<any> = variant.properties[tagName].type as LiteralType<any>;
    const serialized: any = serializer.write(tagBaseType, (curTag as LiteralType<any>).value);
    if (!(typeof serialized === "number" || typeof serialized === "string")) {
      throw new Incident("InvalidSerializedValue", {serialized});
    }
    if (result.has(serialized)) {
      throw new Incident("DuplicateOutTagValue", "The serialized tag values must be unique");
    }
    result.set(serialized, variant);
  }
  return result;
}

function toUnionOptions<T extends {}>(options: TaggedUnionOptions<T>): union.Options<T, any, any, any> {
  const tagName: keyof T = options.tag;
  // tslint:disable-next-line:max-line-length
  const [tagValuesMap, tagBaseType]: [Map<number | string, DocumentType<T>>, JsonSerializer<any, any, any>] = getTagValuesWithBaseType(options);
  const outValuesMaps: WeakMap<Serializer, Map<number | string, DocumentType<T>>> = new WeakMap();

  const matcher: union.Matcher<T> = (value: any) => {
    if (typeof value !== "object" || value === null) {
      return undefined;
    }
    return tagValuesMap.get(value[tagName]);
  };

  const trustedMatcher: union.TrustedMatcher<T> = (value: T) => {
    return tagValuesMap.get((<any> value)[tagName])!;
  };

  const readMatcher: union.ReadMatcher<T> = (input: any, serializer: Serializer) => {
    if (typeof input !== "object" || input === null) {
      return undefined;
    }
    let outValuesMap: Map<number | string, DocumentType<T>> | undefined = outValuesMaps.get(serializer);
    if (outValuesMap === undefined) {
      outValuesMap = createOutValuesMap(tagName, options.variants, tagBaseType, serializer);
    }
    return outValuesMap.get(input[tagName]);
  };

  const readTrustedMatcher: union.ReadTrustedMatcher<T> = (input: any, serializer: Serializer): Type<T> => {
    let outValuesMap: Map<number | string, DocumentType<T>> | undefined = outValuesMaps.get(serializer);
    if (outValuesMap === undefined) {
      outValuesMap = createOutValuesMap(tagName, options.variants, tagBaseType, serializer);
    }
    return outValuesMap.get(input[tagName])!;
  };

  return {variants: options.variants, matcher, trustedMatcher, readMatcher, readTrustedMatcher};
}

export class TaggedUnionType<T extends {}> extends union.UnionType<T> {
  readonly names: string[] = [this.name, name];
  // readonly variants: DocumentType<T>[];

  constructor(options: Lazy<TaggedUnionOptions<T>>, lazy?: boolean) {
    super(() => toUnionOptions(typeof options === "function" ? options() : options), lazy);
  }

  toJSON(): json.Type {
    throw createNotImplementedError("TaggedUnionType#toJSON");
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw createNotImplementedError("TaggedUnionType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw createNotImplementedError("TaggedUnionType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("TaggedUnionType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("TaggedUnionType#squash");
  }
}
