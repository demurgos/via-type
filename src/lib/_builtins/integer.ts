import { IntegerType } from "../integer";

// for (let i = 1; i <= 54; i++) {
//   const n = Math.pow(2, i - 1);
//   console.log(`export const $Sint${i}: IntegerType = new IntegerType({min: ${-n}, max: ${n - 1}});`);
// }

export const $Sint1: IntegerType = new IntegerType({min: -1, max: 0});
export const $Sint2: IntegerType = new IntegerType({min: -2, max: 1});
export const $Sint3: IntegerType = new IntegerType({min: -4, max: 3});
export const $Sint4: IntegerType = new IntegerType({min: -8, max: 7});
export const $Sint5: IntegerType = new IntegerType({min: -16, max: 15});
export const $Sint6: IntegerType = new IntegerType({min: -32, max: 31});
export const $Sint7: IntegerType = new IntegerType({min: -64, max: 63});
export const $Sint8: IntegerType = new IntegerType({min: -128, max: 127});
export const $Sint9: IntegerType = new IntegerType({min: -256, max: 255});
export const $Sint10: IntegerType = new IntegerType({min: -512, max: 511});
export const $Sint11: IntegerType = new IntegerType({min: -1024, max: 1023});
export const $Sint12: IntegerType = new IntegerType({min: -2048, max: 2047});
export const $Sint13: IntegerType = new IntegerType({min: -4096, max: 4095});
export const $Sint14: IntegerType = new IntegerType({min: -8192, max: 8191});
export const $Sint15: IntegerType = new IntegerType({min: -16384, max: 16383});
export const $Sint16: IntegerType = new IntegerType({min: -32768, max: 32767});
export const $Sint17: IntegerType = new IntegerType({min: -65536, max: 65535});
export const $Sint18: IntegerType = new IntegerType({min: -131072, max: 131071});
export const $Sint19: IntegerType = new IntegerType({min: -262144, max: 262143});
export const $Sint20: IntegerType = new IntegerType({min: -524288, max: 524287});
export const $Sint21: IntegerType = new IntegerType({min: -1048576, max: 1048575});
export const $Sint22: IntegerType = new IntegerType({min: -2097152, max: 2097151});
export const $Sint23: IntegerType = new IntegerType({min: -4194304, max: 4194303});
export const $Sint24: IntegerType = new IntegerType({min: -8388608, max: 8388607});
export const $Sint25: IntegerType = new IntegerType({min: -16777216, max: 16777215});
export const $Sint26: IntegerType = new IntegerType({min: -33554432, max: 33554431});
export const $Sint27: IntegerType = new IntegerType({min: -67108864, max: 67108863});
export const $Sint28: IntegerType = new IntegerType({min: -134217728, max: 134217727});
export const $Sint29: IntegerType = new IntegerType({min: -268435456, max: 268435455});
export const $Sint30: IntegerType = new IntegerType({min: -536870912, max: 536870911});
export const $Sint31: IntegerType = new IntegerType({min: -1073741824, max: 1073741823});
export const $Sint32: IntegerType = new IntegerType({min: -2147483648, max: 2147483647});
export const $Sint33: IntegerType = new IntegerType({min: -4294967296, max: 4294967295});
export const $Sint34: IntegerType = new IntegerType({min: -8589934592, max: 8589934591});
export const $Sint35: IntegerType = new IntegerType({min: -17179869184, max: 17179869183});
export const $Sint36: IntegerType = new IntegerType({min: -34359738368, max: 34359738367});
export const $Sint37: IntegerType = new IntegerType({min: -68719476736, max: 68719476735});
export const $Sint38: IntegerType = new IntegerType({min: -137438953472, max: 137438953471});
export const $Sint39: IntegerType = new IntegerType({min: -274877906944, max: 274877906943});
export const $Sint40: IntegerType = new IntegerType({min: -549755813888, max: 549755813887});
export const $Sint41: IntegerType = new IntegerType({min: -1099511627776, max: 1099511627775});
export const $Sint42: IntegerType = new IntegerType({min: -2199023255552, max: 2199023255551});
export const $Sint43: IntegerType = new IntegerType({min: -4398046511104, max: 4398046511103});
export const $Sint44: IntegerType = new IntegerType({min: -8796093022208, max: 8796093022207});
export const $Sint45: IntegerType = new IntegerType({min: -17592186044416, max: 17592186044415});
export const $Sint46: IntegerType = new IntegerType({min: -35184372088832, max: 35184372088831});
export const $Sint47: IntegerType = new IntegerType({min: -70368744177664, max: 70368744177663});
export const $Sint48: IntegerType = new IntegerType({min: -140737488355328, max: 140737488355327});
export const $Sint49: IntegerType = new IntegerType({min: -281474976710656, max: 281474976710655});
export const $Sint50: IntegerType = new IntegerType({min: -562949953421312, max: 562949953421311});
export const $Sint51: IntegerType = new IntegerType({min: -1125899906842624, max: 1125899906842623});
export const $Sint52: IntegerType = new IntegerType({min: -2251799813685248, max: 2251799813685247});
export const $Sint53: IntegerType = new IntegerType({min: -4503599627370496, max: 4503599627370495});
export const $Sint54: IntegerType = new IntegerType({min: -9007199254740992, max: 9007199254740991});

// for (let i = 1; i <= 53; i++) {
//   const n = Math.pow(2, i);
//   console.log(`export const $Uint${i}: IntegerType = new IntegerType({min: 0, max: ${n - 1}});`);
// }

export const $Uint1: IntegerType = new IntegerType({min: 0, max: 1});
export const $Uint2: IntegerType = new IntegerType({min: 0, max: 3});
export const $Uint3: IntegerType = new IntegerType({min: 0, max: 7});
export const $Uint4: IntegerType = new IntegerType({min: 0, max: 15});
export const $Uint5: IntegerType = new IntegerType({min: 0, max: 31});
export const $Uint6: IntegerType = new IntegerType({min: 0, max: 63});
export const $Uint7: IntegerType = new IntegerType({min: 0, max: 127});
export const $Uint8: IntegerType = new IntegerType({min: 0, max: 255});
export const $Uint9: IntegerType = new IntegerType({min: 0, max: 511});
export const $Uint10: IntegerType = new IntegerType({min: 0, max: 1023});
export const $Uint11: IntegerType = new IntegerType({min: 0, max: 2047});
export const $Uint12: IntegerType = new IntegerType({min: 0, max: 4095});
export const $Uint13: IntegerType = new IntegerType({min: 0, max: 8191});
export const $Uint14: IntegerType = new IntegerType({min: 0, max: 16383});
export const $Uint15: IntegerType = new IntegerType({min: 0, max: 32767});
export const $Uint16: IntegerType = new IntegerType({min: 0, max: 65535});
export const $Uint17: IntegerType = new IntegerType({min: 0, max: 131071});
export const $Uint18: IntegerType = new IntegerType({min: 0, max: 262143});
export const $Uint19: IntegerType = new IntegerType({min: 0, max: 524287});
export const $Uint20: IntegerType = new IntegerType({min: 0, max: 1048575});
export const $Uint21: IntegerType = new IntegerType({min: 0, max: 2097151});
export const $Uint22: IntegerType = new IntegerType({min: 0, max: 4194303});
export const $Uint23: IntegerType = new IntegerType({min: 0, max: 8388607});
export const $Uint24: IntegerType = new IntegerType({min: 0, max: 16777215});
export const $Uint25: IntegerType = new IntegerType({min: 0, max: 33554431});
export const $Uint26: IntegerType = new IntegerType({min: 0, max: 67108863});
export const $Uint27: IntegerType = new IntegerType({min: 0, max: 134217727});
export const $Uint28: IntegerType = new IntegerType({min: 0, max: 268435455});
export const $Uint29: IntegerType = new IntegerType({min: 0, max: 536870911});
export const $Uint30: IntegerType = new IntegerType({min: 0, max: 1073741823});
export const $Uint31: IntegerType = new IntegerType({min: 0, max: 2147483647});
export const $Uint32: IntegerType = new IntegerType({min: 0, max: 4294967295});
export const $Uint33: IntegerType = new IntegerType({min: 0, max: 8589934591});
export const $Uint34: IntegerType = new IntegerType({min: 0, max: 17179869183});
export const $Uint35: IntegerType = new IntegerType({min: 0, max: 34359738367});
export const $Uint36: IntegerType = new IntegerType({min: 0, max: 68719476735});
export const $Uint37: IntegerType = new IntegerType({min: 0, max: 137438953471});
export const $Uint38: IntegerType = new IntegerType({min: 0, max: 274877906943});
export const $Uint39: IntegerType = new IntegerType({min: 0, max: 549755813887});
export const $Uint40: IntegerType = new IntegerType({min: 0, max: 1099511627775});
export const $Uint41: IntegerType = new IntegerType({min: 0, max: 2199023255551});
export const $Uint42: IntegerType = new IntegerType({min: 0, max: 4398046511103});
export const $Uint43: IntegerType = new IntegerType({min: 0, max: 8796093022207});
export const $Uint44: IntegerType = new IntegerType({min: 0, max: 17592186044415});
export const $Uint45: IntegerType = new IntegerType({min: 0, max: 35184372088831});
export const $Uint46: IntegerType = new IntegerType({min: 0, max: 70368744177663});
export const $Uint47: IntegerType = new IntegerType({min: 0, max: 140737488355327});
export const $Uint48: IntegerType = new IntegerType({min: 0, max: 281474976710655});
export const $Uint49: IntegerType = new IntegerType({min: 0, max: 562949953421311});
export const $Uint50: IntegerType = new IntegerType({min: 0, max: 1125899906842623});
export const $Uint51: IntegerType = new IntegerType({min: 0, max: 2251799813685247});
export const $Uint52: IntegerType = new IntegerType({min: 0, max: 4503599627370495});
export const $Uint53: IntegerType = new IntegerType({min: 0, max: 9007199254740991});

export const $SafeInteger: IntegerType = new IntegerType({min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER});
