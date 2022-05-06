import { TaggedUnionType } from "../../../lib/tagged-union.mjs";
import { $Directory, Directory } from "./directory.mjs";
import { $File, File } from "./file.mjs";

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
