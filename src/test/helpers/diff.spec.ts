import {assert} from "chai";
import {DiffAction, diffSync} from "../../lib/_helpers/diff";

describe("Diff", function () {
  it('"rosettacode" -> "raisethysword"', function () {
    const actual: DiffAction[] = diffSync("rosettacode", "raisethysword");
    const expected: DiffAction[] = [
      {type: "match", value: 1},   // r    r
      {type: "source", value: 1},  // o
      {type: "target", value: 2},  //      ai
      {type: "match", value: 3},   // set  set
      {type: "source", value: 3},  // tac
      {type: "target", value: 4},  //      hysw
      {type: "match", value: 1},   // o    o
      {type: "target", value: 1},  //      r
      {type: "match", value: 1},   // d    d
      {type: "source", value: 1},  // e
    ];
    assert.deepEqual(actual, expected);
  });
});
