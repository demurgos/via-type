/**
 * String.isWellFormed polyfill from:
 * <https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.is-well-formed.js>
 */
export function stringIsWellFormed(s: string) {
  const length: number = s.length;
  for (let i: number = 0; i < length; i++) {
    const charCode = s.charCodeAt(i);
    // single UTF-16 code unit
    if ((charCode & 0xF800) !== 0xD800) {continue;}
    // unpaired surrogate
    if (charCode >= 0xDC00 || ++i >= length || (s.charCodeAt(i) & 0xFC00) !== 0xDC00) {return false;}
  }
  return true;
}
