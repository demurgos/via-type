import { CaseStyle } from "../../../lib/case-style";
import { DocumentType } from "../../../lib/types/document";
import { Ucs2StringType } from "../../../lib/types/ucs2-string";
import { $FsNodeType, FsNodeType } from "./fs-node-type";

export interface FsNodeBase {
  tag: FsNodeType;
  name: string;
}

export const $FsNodeBase: DocumentType<FsNodeBase> = new DocumentType<FsNodeBase>({
  properties: {
    tag: {type: $FsNodeType},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  rename: CaseStyle.SnakeCase,
});
