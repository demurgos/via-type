import { TsEnumType } from "../../../lib/ts-enum.mjs";

export enum FsNodeType {
  File,
  Directory,
}

export const $FsNodeType: TsEnumType<FsNodeType> = new TsEnumType<FsNodeType>({
  enum: FsNodeType,
  rename: {
    File: "Node/File",
    Directory: "Node/Directory",
  },
});
