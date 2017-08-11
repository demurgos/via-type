// Implementation of the Hirschberg algorithm
// Time: O(mn)
// Space: O(min(m, n))
// See: https://en.wikipedia.org/wiki/Hirschberg%27s_algorithm

/*
 * Levenshtein distance
 *
 * The distance is calculate with a grid of n+1 columns and m+1 lines.
 *
 * The top row is initialized with integers from 0 to `n`, the left column with
 * integers from 0 to `m`.
 *
 * Then, we fill the grid with the following equation:
 *
 * ```
 * ┼─┼─┼   r = min(a + 1, d + 1, isMatch ? m : m + 1)                   [eq. 01]
 * │m│a│           └─┬─┘  └─┬─┘            │   └─┬─┘
 * ┼─┼─┼            ADD    DEL          MATCH   MUT
 * │d│r│
 * ┼─┼─┼
 * ```
 *
 * The result distance can be obtained from the distances of prefixes.
 * The value obtained from the distance `m` depends on the comparison of the
 * current items (isMatch means that the items are equal). The equality test can
 * be expensive so we want to avoid it when possible.
 * We can avoid the test if the following equality is true:
 * ```
 * min(a + 1, d + 1) <= m                                               [eq. 02]
 * ```
 * (In this case, even if we get a match it will not change the value of `r`)
 *
 */

/**
 * Represents a sequence of items: either a string or an array.
 */
interface Sequence<T> {
  length: number;
  [index: number]: T;
}

/**
 * Represents a slice of a sequence of items. This allows to abstract the access to the items
 * and prevent extraneous copies of the sequence.
 */
class Slice<T> {
  /**
   * The original sequence.
   */
  sequence: Sequence<T>;

  /**
   * The index of the first item in the slice, relative to the original sequence.
   */
  start: number;

  /**
   * The index **after** the last item in the slice, relative to the original sequence.
   */
  end: number;

  /**
   * The length of the slice.
   */
  length: number;

  /**
   * Reverse the access to the items: slice.get(0) will return the last item instead of the first.
   */
  reversed: boolean;

  constructor(sequence: Sequence<T>, start: number, end: number, reversed: boolean) {
    this.sequence = sequence;
    this.start = start;
    this.end = end;
    this.length = end - start;
    this.reversed = reversed;
  }

  indexOf(item: T): number {
    if (this.reversed) {
      for (let i: number = this.end - 1; i >= this.start; i--) {
        if (this.sequence[i] === item) {
          return this.end - 1 - i;
        }
      }
    } else {
      for (let i: number = this.start; i < this.end; i++) {
        if (this.sequence[i] === item) {
          return i - this.start;
        }
      }
    }
    return -1;
  }

  getItem(index: number): T {
    return this.sequence[this.getAbsoluteIndex(index)];
  }

  getAbsoluteIndex(relativeIndex: number): number {
    if (this.reversed) {
      return (this.end - 1) - relativeIndex;
    } else {
      return this.start + relativeIndex;
    }
  }

  split (index: number): [Slice<T>, Slice<T>] {
    if (this.reversed) {
      throw Error("Cannot split reversed");
    }
    const left: Slice<T> = new Slice(this.sequence, this.start, this.start + index, false);
    const right: Slice<T> = new Slice(this.sequence, this.start + index, this.end, false);
    return [left, right];
  }

  reverse (): Slice<T> {
    return new Slice(this.sequence, this.start, this.end, true);
  }
}

export interface DiffAction {
  type: "source" | "target" | "match";
  value: number;
}

type IndexValue = [number, number];

function nearestEnd <T> (src: Slice<T>, target: Slice<T>): IndexValue {
  const xSeq: Sequence<T> = src.sequence;
  const x1: number = 0;
  const x2: number = src.length;
  const ySeq: Sequence<T> = target.sequence;
  const y1: number = 0;
  const y2: number = target.length;
  const xLen: number = x2 - x1;
  const yLen: number = y2 - y1;

  // We do not need to store the whole matrix: we just need the current and
  // previous rows.
  let oldDist: number[] = Array(yLen + 1);
  let curDist: number[] = Array(yLen + 1);

  // Fill the first row
  for (let col: number = 0; col <= yLen; col++) {
    curDist[col] = col;
  }

  // Traverse xSeq
  for (let row: number = 1; row <= xLen; row++) {
    [curDist, oldDist] = [oldDist, curDist];

    const rowItem: T = src.getItem(row - 1);

    // Initialize first column
    curDist[0] = row;

    // Compute distances
    for (let col: number = 1; col <= yLen; col++) {
      // Nearest distance in case of ADD or DEL
      const addDelDist: number = 1 + Math.min(oldDist[col], curDist[col - 1]);
      // Nearest distance in case of MATCH
      const matchDist: number = oldDist[col - 1];
      // Nearest distance in case of MUT
      const mutDist: number = matchDist + 1;

      if (addDelDist <= matchDist) {
        // See the comment above about skipping the test `colItem === rowItem`
        curDist[col] = addDelDist;
      } else {
        const colItem: T = target.getItem(col - 1);
        curDist[col] = colItem === rowItem ? matchDist : mutDist;
      }
    }
  }

  // Search for minimum in the last line
  let minDistCol: number = 0;
  for (let col: number = 1; col <= yLen; col++) {
    // We use equality to get the rightmost minimal value.
    if (curDist[col] <= curDist[minDistCol]) {
      minDistCol = col;
    }
  }

  const minDistIndex: number = minDistCol - 1;
  const minDistValue: number = curDist[minDistCol];
  return [minDistIndex, minDistValue];
}

function hirschberg (source: Slice<any>, target: Slice<any>): DiffAction[] {
  const srcLen: number = source.length;
  const tarLen: number = target.length;

  if (srcLen === 0 || tarLen === 0) {
    if (srcLen > 0) {
      return [{type: "source", value: srcLen}];
    } else if (tarLen > 0) {
      return [{type: "target", value: tarLen}];
    } else {  // srcLen === 0 && tarLen === 0
      return [];
    }
  } else if (srcLen === 1 || tarLen === 1) {
    let idx: number = source.indexOf(target.getItem(0));
    if (srcLen > 1 && idx >= 0) {
      return [
        {type: "source", value: idx},
        {type: "match", value: 1},
        {type: "source", value: srcLen - idx - 1},
      ];
    } else {
      idx = target.indexOf(source.getItem(0));
      if (idx >= 0) {
        return [
          {type: "target", value: idx},
          {type: "match", value: 1},
          {type: "target", value: tarLen - idx - 1},
        ];
      } else {
        return [
          {type: "source", value: srcLen},
          {type: "target", value: tarLen},
        ];
      }
    }
  } else {
    const srcMid: number = Math.floor(srcLen / 2);
    const [srcLeft, srcRight]: [Slice<any>, Slice<any>] = source.split(srcMid);
    const [leftMinDistIdx, leftMinVal]: [number, number] = nearestEnd(srcLeft, target);
    const [rightMinDistIdx, rightMinVal]: [number, number] = nearestEnd(srcRight.reverse(), target.reverse());
    let targetMid: number;
    if (leftMinVal <= rightMinVal) {
      // We add one because the right of the range is exclusive
      targetMid = leftMinDistIdx + 1;
    } else {
      // Convert the right index from the reversed tarRight to target
      targetMid = (target.length - 1) - rightMinDistIdx;
    }
    const [tarLeft, tarRight]: [Slice<any>, Slice<any>] = target.split(targetMid);
    const left: DiffAction[] = hirschberg(srcLeft, tarLeft);
    const right: DiffAction[] = hirschberg(srcRight, tarRight);
    return [...left, ...right];
  }
}

export function normalizeDiff (diff: DiffAction[]): DiffAction[] {
  const result: DiffAction[] = [];
  if (diff.length === 0) {
    return result;
  }
  let curSource: number = 0;
  let curTarget: number = 0;
  let curBoth: number = 0;
  for (const action of diff) {
    if (action.value === 0) {
      continue;
    }

    if (action.type === "match") {
      if (curSource > 0) {
        result.push({type: "source", value: curSource});
        curSource = 0;
      }
      if (curTarget > 0) {
        result.push({type: "target", value: curTarget});
        curTarget = 0;
      }
      curBoth += action.value;
    } else {
      if (curBoth > 0) {
        result.push({type: "match", value: curBoth});
        curBoth = 0;
      }
      if (action.type === "source") {
        curSource += action.value;
      } else { // action.type === "target"
        curTarget += action.value;
      }
    }
  }
  if (curSource > 0) {
    result.push({type: "source", value: curSource});
  }
  if (curTarget > 0) {
    result.push({type: "target", value: curTarget});
  }
  if (curBoth > 0) {
    result.push({type: "match", value: curBoth});
  }
  return result;
}

export function diffSync (seq1: string | any[], seq2: string | any[]): DiffAction[] {
  return normalizeDiff(hirschberg(new Slice(seq1, 0, seq1.length, false), new Slice(seq2, 0, seq2.length, false)));
}

/*
 * Structure of the Levenshtein matrix
 *
 * Let's see which information about the grid we can get from the equation
 * of `r`.
 * By definition of `min`, we have:
 *
 * ```
 * ┼─┼─┼
 * │m│a│   r <= m + 1  (This is true independently of `isMatch`)        [eq. 03]
 * ┼─┼─┼   r <= a + 1                                                   [eq. 04]
 * │d│r│   r <= d + 1                                                   [eq. 05]
 * ┼─┼─┼
 * ```
 *
 * This means that growth of the distance when we go to the right or down is
 * bounded. You cannot increase of more than 1 when going to the right or down.
 *
 * It means that the following configurations are impossible:
 *
 * ```
 * ┼─┼─┼
 * │5│ │   IMPOSSIBLE, breaks: r <= m + 1
 * ┼─┼─┼
 * │ │7│
 * ┼─┼─┼
 *
 * ┼─┼─┼
 * │ │5│   IMPOSSIBLE, breaks: r <= a + 1
 * ┼─┼─┼
 * │ │7│
 * ┼─┼─┼
 *
 * ┼─┼─┼
 * │ │ │   IMPOSSIBLE, breaks: r <= d + 1
 * ┼─┼─┼
 * │5│7│
 * ┼─┼─┼
 * ```
 *
 * Since these inequalities are relative to a `r`, we can translate them:
 * ```
 * ┼─┼─┼
 * │m│a│   d <= m + 1   (from [eq. 4])                                  [eq. 06]
 * ┼─┼─┼   a <= m + 1   (from [eq. 5])                                  [eq. 07]
 * │d│r│
 * ┼─┼─┼
 * ```
 *
 * We can also add a lower bound to the growth when going to the right or down:
 * ```
 * a - 1 <= r                                                           [eq. 08]
 * d - 1 <= r                                                           [eq. 09]
 * ```
 * So `r` cannot grow faster than `1` per cell, but also cannot decrease faster.
 *
 * This means that the following configuration are impossible:
 *
 * ```
 * ┼─┼─┼
 * │ │7│   IMPOSSIBLE, breaks: a - 1 <= r
 * ┼─┼─┼
 * │ │5│
 * ┼─┼─┼
 *
 * ┼─┼─┼
 * │ │ │   IMPOSSIBLE, breaks: d - 1 <= r
 * ┼─┼─┼
 * │7│5│
 * ┼─┼─┼
 * ```
 *
 * We will only prove the first inequality `a - 1 <= r` since both inequalities
 * are in fact equivalent due to the symmetry of the problem.
 *
 * To demonstrate it, we'll use a proof by contradiction: we will show that it
 * simply cannot be otherwise.
 * The opposite of `a - 1 <= r` is:
 * ```
 * a - 1 > r                                                            [eq. 10]
 * ```
 * This inequality is incompatible with the value of `r` whether it comes from
 * a MATCH, MUT, ADD or DEL:
 *
 *
 * MATCH:
 * ```
 * r = m              (definition of MATCH)
 * a - 1 > r          (hypothesis)
 * a <= m + 1         (previous constraint [eq. 07])
 * ```
 * We can transform it:
 * ```
 * r = m
 * a > r + 1          (move `-1` to the right side)
 * a <= r + 1         (substitute `m` for `r`)
 * ```
 * This system does not have any solution.
 *
 * MUT:
 * ```
 * r = m + 1          (definition of MUT)
 * a - 1 > r          (hypothesis)
 * a <= m + 1         (previous constraint [eq. 07])
 * ```
 * We can transform it:
 * ```
 * r = m
 * a > r + 1          (move `-1` to the right side)
 * a <= r             (substitute `m + 1` for `r`)
 * ```
 * This system does not have any solution.
 *
 *
 * ADD:
 * ```
 * r = a + 1          (definition of ADD)
 * a - 1 > r          (hypothesis)
 * ```
 * This system does not have any solution.
 *
 *
 * DEL:
 * So far we've seen that the MATCH, MUT and ADD for `r` are incompatible
 * with `a - 1 > r`. Let's check the last case: DEL.
 *
 * ```
 * r = d + 1          (definition of DEL)
 * a - 1 > r          (hypothesis)
 * a <= m + 1         (previous constraint)
 * ```
 * We can transform it:
 * ```
 * r - 1 = d          (move `1` to the left)
 * a > r + 1          (move `-1` to the right)
 * m + 1 >= a         (swap)
 * ```
 * And again:
 * ```
 * d = r - 1          (swap)
 * a > r + 1
 * m + 1 >= a
 * m + 1 > r + 1      (transitivity with line 2 and 3: m + 1 >= a > r + 1)
 * ```
 * And again:
 * ```
 * d = r - 1          (swap)
 * a > r + 1
 * m + 1 >= a
 * m > r              (cancel `1`)
 * ```
 * And again:
 * ```
 * d = r - 1
 * a > r + 1
 * m + 1 >= a
 * m > d + 1          (Substitute `r` for `d+1`)
 * ```
 * We can place these equations on the grid to better visualize the situation.
 * ```
 * ┼─────┼─────┼
 * │> d+1│> r+1│
 * ┼─────┼─────┼
 * │  d  │  r  │
 * ┼─────┼─────┼
 *
 * ```
 *
 * If we recap what we know:
 *
 * The cell above `r` can have a value (strictly) greater than `r + 1`
 * IF
 * The cell above `d` has a value (strictly) greater than `d + 1`.
 *
 * So to have a decrease of 2 or more between one cell and the cell below, we
 * have to have a decrease of 2 or more on the column to the left.
 * Recursively, to have a decrease of 2 or more on the column `j-1`, we need
 * this decrease on `j-2` so also on `j-3` and also on `j-4` and so on until we
 * reach the leftmost column...
 *
 * > The top row is initialized with integers from 0 to `n`, the left column
 * > with integers from 0 to `m`.
 *
 * The leftmost column is strictly increasing so it does not contain any
 * decrease of two or more. This means that the pattern described above is
 * impossible and `a - 1 > r` is not possible with a DEL operation.
 *
 * `a - 1 > r` is not possible with any operation, it is always false.
 * So, its opposite `a - 1 <= r` is always true. Or we could just have said that
 * the problem is symmetric if we reverse both strings.
 */
