import { CaseStyle } from "../../../lib/case-style";
import { DocumentType } from "../../../lib/types/document";
import { IntegerType } from "../../../lib/types/integer";
import { LiteralType } from "../../../lib/types/literal";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base";
import { $FsNodeType, FsNodeType } from "./fs-node-type";

export interface File extends FsNodeBase {
  tag: FsNodeType.File;
  size: number;
}

export const $File: DocumentType<File> = new DocumentType<File>(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.File>({type: $FsNodeType, value: FsNodeType.File})},
    size: {type: new IntegerType()},
  },
  rename: CaseStyle.SnakeCase,
}));
