/**
 * Checked version of `punycode.ucs2.decode`, throws an error if
 * there is an unmatched surrogate half.
 *
 * @see <https://github.com/bestiejs/punycode.js/issues/67>
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @param {Boolean} check Throw an error if there is an unmatched surrogate half.
 * @returns {Array} The new array of code points.
 */
export function checkedUcs2Decode(string: string, check: boolean = true) {
  const output: number[] = [];
  let counter: number = 0;
  const length: number = string.length;
  while (counter < length) {
    const value: number = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      const extra: number = string.charCodeAt(counter++);
      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else if (check) {
        throw new Error(`Unmatched high surrogate half at index ${counter - 2}`);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        output.push(value);
        counter--;
      }
    } else if (value >= 0xD800 && value <= 0xDBFF && counter === length) {
      throw new Error(`Unmatched high surrogate half at index ${counter - 1}`);
    } else if ((value & 0xFC00) === 0xDC00) {
      // Low surrogate that wasn't matched by a preceding high surrogate.
      throw new Error(`Unmatched low surrogate half at index ${counter - 1}`);
    } else {
      output.push(value);
    }
  }
  return output;
}
