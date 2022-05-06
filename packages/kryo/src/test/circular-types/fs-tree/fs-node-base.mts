import { CaseStyle } from "../../../lib/index.mjs";
import { RecordType } from "../../../lib/record.mjs";
import { Ucs2StringType } from "../../../lib/ucs2-string.mjs";
import { $FsNodeType, FsNodeType } from "./fs-node-type.mjs";

export interface FsNodeBase {
  tag: FsNodeType;
  name: string;
}

export const $FsNodeBase: RecordType<FsNodeBase> = new RecordType<FsNodeBase>({
  properties: {
    tag: {type: $FsNodeType},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});
