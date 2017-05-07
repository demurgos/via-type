import {Incident} from "incident";
import {NotImplementedError} from "../errors/not-implemented";
import {SerializableType} from "../interfaces";
import {DocumentType} from "./document";
import {LiteralType} from "./literal";
import {SimpleEnumType} from "./simple-enum";
import * as union from "./union";

export type Name = "tagged-union";
export const name: Name = "tagged-union";
export namespace bson {
  export interface Input {
    [key: string]: any;
  }
  export interface Output {
    [key: string]: any;
  }
}
export namespace json {
  export interface Input {
    [key: string]: any;
  }
  export interface Output {
    [key: string]: any;
  }
  export type Type = undefined;
}
export namespace qs {
  export interface Input {
    [key: string]: any;
  }
  export interface Output {
    [key: string]: any;
  }
}
export type Diff = any;

export interface Options<T extends {}, Output, Input extends Output, Diff> {
  variants: DocumentType<T>[];
  tag: string;
}

function toUnionOptions<T extends {}>(options: Options<T, any, any, any>): union.Options<T, any, any, any> {
  const tagName: string = options.tag;
  let tagBaseType: SerializableType<any, any, any, any> | undefined = undefined;
  const tagValuesMap: Map<number | string, DocumentType<T>> = new Map();
  const outValuesMap: {
    bson: Map<number | string, DocumentType<T>>,
    json: Map<number | string, DocumentType<T>>,
    qs: Map<number | string, DocumentType<T>>
  } = {
    bson: new Map(),
    json: new Map(),
    qs: new Map()
  };

  for (const variant of options.variants) {
    if (!(tagName in variant.properties)) {
      throw new Incident("TagNotFound", "Tag not found in variant of tagged union");
    }
    if (!(variant.properties[tagName].type instanceof LiteralType)) {
      throw new Incident("NonLiteralTag", "Tag property must be a literal type");
    }
    const tagType: LiteralType<any> = variant.properties[tagName].type as LiteralType<any>;
    if (tagBaseType === undefined) {
      if (tagType.type instanceof SimpleEnumType) {
        tagBaseType = tagType.type;
      } else {
        throw new Incident("InvalidTagBaseType", "The base type of a tag property must be a simple enum");
      }
    } else if (tagType.type !== tagBaseType) {
      throw new Incident("MixedTagBaseType", "All the variants of a tag property must have the same base type");
    }
    if (!(typeof tagType.value === "number" || typeof tagType.value === "string")) {
      throw new Incident("InvalidTagValue", "The value of a tag property must be a number or string");
    }
    const value: number | string = tagType.value;
    if (tagValuesMap.has(value)) {
      throw new Incident("DuplicateTagValue", "The tag values must be unique");
    }
    tagValuesMap.set(value, variant);
    for (const format in outValuesMap) {
      const value: string = tagBaseType.write(format, tagType.value);
      if ((<any> outValuesMap)[format].has(value)) {
        throw new Incident("DuplicateOutTagValue", `The tag values for ${format} must be unique`);
      }
      (<any> outValuesMap)[format].set(value, variant);
    }
  }
  const matcher: union.Matcher<T, any, any, any> = (value: any) => {
    if (typeof value !== "object" || value === null) {
      return undefined;
    }
    return tagValuesMap.get(value[tagName]);
  };
  const trustedMatcher: union.TrustedMatcher<T, any, any, any> = (value: T) => {
    return tagValuesMap.get((<any> value)[tagName])!;
  };
  const readMatcher: union.ReadMatcher<T, any, any, any> = (format: "bson" | "json" | "qs", value: any) => {
    if (typeof value !== "object" || value === null) {
      return undefined;
    }
    if (!(format in outValuesMap)) {
      return undefined;
    }
    return (<any> outValuesMap)[format].get(value[tagName]);
  };
  const readTrustedMatcher: union.ReadTrustedMatcher<T, any, any, any> = (
    format: "bson" | "json" | "qs",
    value: T
  ) => {
    return (<any> outValuesMap)[format].get((<any> value)[tagName])!;
  };
  return {variants: options.variants, matcher, trustedMatcher, readMatcher, readTrustedMatcher};
}

export class TaggedUnionType<T extends {}> extends union.UnionType<T> {
  readonly names: string[] = [this.name, name];
  readonly variants: DocumentType<T>[];

  constructor(options: Options<T, any, any, any>) {
    super(toUnionOptions(options));
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("TaggedUnionType#toJSON");
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw NotImplementedError.create("TaggedUnionType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw NotImplementedError.create("TaggedUnionType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("TaggedUnionType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("TaggedUnionType#squash");
  }
}

export {TaggedUnionType as Type};
