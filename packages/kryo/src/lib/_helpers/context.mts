import {Check} from "../checks/index.mjs";
import {AnyKey, CheckId, KryoContext, ResultErr} from "../index.mjs";

export function enter<R>(cx: KryoContext | null, key: AnyKey, cb: () => R): R {
  return cx !== null ? cx.enter(key, cb) : cb();
}

export function writeCheck(cx: KryoContext | null, check: Check): CheckId {
  return cx !== null ? cx.write(check) : 0;
}

export function writeError(cx: KryoContext | null, check: Check): ResultErr<CheckId> {
  return {ok: false, value: writeCheck(cx, check)};
}
