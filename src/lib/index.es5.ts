import "es6-shim";

export {Type, SerializableType, VersionedType} from "./interfaces";

export {ArrayType} from "./types/array";
export {BooleanType} from "./types/boolean";
export {CodepointStringType} from "./types/codepoint-string";
export {DateType} from "./types/date";
export {DocumentType} from "./types/document";
export {Float64Type} from "./types/float64";
export {Int32Type} from "./types/int32";
export {NullType} from "./types/null";
export {SimpleEnumType} from "./types/simple-enum";
export {TypedUnionType} from "./types/typed-union";
export {Ucs2StringType} from "./types/ucs2-string";

import * as array from "./types/array";
import * as boolean from "./types/boolean";
import * as codepointString  from "./types/codepoint-string";
import * as date  from "./types/date";
import * as document  from "./types/document";
import * as float64  from "./types/float64";
import * as int32  from "./types/int32";
import * as _null  from "./types/null";
import * as simpleEnum  from "./types/simple-enum";
import * as typedUnion  from "./types/typed-union";
import * as ucs2String  from "./types/ucs2-string";
export {
  array,
  boolean,
  codepointString,
  date,
  document,
  float64,
  int32,
  _null as null,
  simpleEnum,
  typedUnion,
  ucs2String
};

import * as errors from "./errors/index";
export {errors};

export {CaseStyle} from "./helpers/rename";
