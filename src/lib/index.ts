// This file assumes that the environment supports ES2015 (ES6)

export {Type, SerializableType, VersionedType} from "./interfaces";

export {ArrayType} from "./types/array";
export {BooleanType} from "./types/boolean";
export {BufferType} from "./types/buffer";
export {CodepointStringType} from "./types/codepoint-string";
export {DateType} from "./types/date";
export {DocumentType} from "./types/document";
export {Float64Type} from "./types/float64";
export {Int32Type} from "./types/int32";
export {LiteralType} from "./types/literal";
export {MapType} from "./types/map";
export {NullType} from "./types/null";
export {SimpleEnumType} from "./types/simple-enum";
export {TaggedUnionType} from "./types/tagged-union";
export {TypedUnionType} from "./types/typed-union";
export {Ucs2StringType} from "./types/ucs2-string";
export {UnionType} from "./types/union";

import * as array from "./types/array";
import * as boolean from "./types/boolean";
import * as buffer from "./types/buffer";
import * as codepointString  from "./types/codepoint-string";
import * as date  from "./types/date";
import * as document  from "./types/document";
import * as float64  from "./types/float64";
import * as int32  from "./types/int32";
import * as literal  from "./types/literal";
import * as map  from "./types/map";
import * as _null  from "./types/null";
import * as simpleEnum  from "./types/simple-enum";
import * as taggedUnion  from "./types/tagged-union";
import * as typedUnion  from "./types/typed-union";
import * as ucs2String  from "./types/ucs2-string";
import * as union  from "./types/union";
export {
  array,
  boolean,
  buffer,
  codepointString,
  date,
  document,
  float64,
  int32,
  literal,
  map,
  _null as null,
  simpleEnum,
  taggedUnion,
  typedUnion,
  ucs2String,
  union,
};

import * as errors from "./errors/index";
export {errors};

export {CaseStyle} from "./helpers/rename";
