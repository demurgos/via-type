import {Check} from "../checks/index.mjs";
import {CheckId, KryoContext, ResultErr} from "../index.mjs";

export function writeError(cx: KryoContext | null, check: Check): ResultErr<CheckId> {
  return {ok: false, value: cx !== null ? cx.write(check) : 0};
}
