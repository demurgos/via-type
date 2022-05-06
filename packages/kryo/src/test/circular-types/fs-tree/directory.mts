import { ArrayType } from "../../../lib/array.mjs";
import { CaseStyle } from "../../../lib/index.mjs";
import { LiteralType } from "../../../lib/literal.mjs";
import { RecordType } from "../../../lib/record.mjs";
import { $FsNode, FsNode } from "./fs-node.mjs";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base.mjs";
import { $FsNodeType, FsNodeType } from "./fs-node-type.mjs";

export interface Directory extends FsNodeBase {
  tag: FsNodeType.Directory;
  children: FsNode[];
}

export const $Directory: RecordType<Directory> = new RecordType<Directory>(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.Directory>({type: $FsNodeType, value: FsNodeType.Directory})},
    children: {type: new ArrayType({itemType: $FsNode, maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
}));
