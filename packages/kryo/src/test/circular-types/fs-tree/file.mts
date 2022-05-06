import { CaseStyle } from "../../../lib/index.mjs";
import { IntegerType } from "../../../lib/integer.mjs";
import { LiteralType } from "../../../lib/literal.mjs";
import { RecordType } from "../../../lib/record.mjs";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base.mjs";
import { $FsNodeType, FsNodeType } from "./fs-node-type.mjs";

export interface File extends FsNodeBase {
  tag: FsNodeType.File;
  size: number;
}

export const $File: RecordType<File> = new RecordType<File>(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.File>({type: $FsNodeType, value: FsNodeType.File})},
    size: {type: new IntegerType()},
  },
  changeCase: CaseStyle.SnakeCase,
}));
