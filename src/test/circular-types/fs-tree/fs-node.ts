import { TaggedUnionType } from "../../../lib/types/tagged-union";
import { $Directory, Directory } from "./directory";
import { $File, File } from "./file";

export type FsNode =
  Directory
  | File;

export const $FsNode: TaggedUnionType<FsNode> = new TaggedUnionType<FsNode>(() => ({
  variants: [
    $Directory,
    $File,
  ],
  tag: "tag",
}));
