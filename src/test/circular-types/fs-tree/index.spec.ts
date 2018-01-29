import { runTests, TypedValue } from "../../helpers/test";
import { $File } from "./file";
import { $FsNode } from "./fs-node";
import { FsNodeType } from "./fs-node-type";

/**
 * Modelizes a simple file system with two kinds of nodes: files and directories.
 */
describe("FS Tree", function () {
  describe("File", function () {
    const items: TypedValue[] = [
      {value: {tag: FsNodeType.File, name: "a", size: 1}, valid: true},
      {value: {tag: FsNodeType.File, name: 2, size: 1}, valid: false},
    ];
    runTests($File, items);
  });

  describe("FsNode", function () {
    const items: TypedValue[] = [
      {value: {tag: FsNodeType.File, name: "a", size: 1}, valid: true},
      {value: {tag: FsNodeType.File, name: 2, size: 1}, valid: false},
    ];
    runTests($FsNode, items);
  });
});
