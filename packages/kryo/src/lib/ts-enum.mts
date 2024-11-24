import {rename} from "./_helpers/case-style.mjs";
import {writeError} from "./_helpers/context.mjs";
import {lazyProperties} from "./_helpers/lazy-properties.mjs";
import {CheckKind} from "./checks/check-kind.mjs";
import {AnyKey, CaseStyle, CheckId, IoType, KryoContext, Lazy, Reader, Result, Writer} from "./index.mjs";
import {readVisitor} from "./readers/read-visitor.mjs";

/**
 * Represents an enum value defined in `EnumConstructor`
 */
export type TsEnum<EnumConstructor> = { [K in keyof EnumConstructor]: EnumConstructor[K] };

export type Name = "ts-enum";
export const name: Name = "ts-enum";
export type Diff = number;

export type EnumObject<EO, E extends AnyKey> = Record<keyof EO, E>;

/**
 * Builds a map from a TS enum by removing reverse-lookup keys.
 */
function tsEnumToMap<K extends string, E extends AnyKey>(tsEnum: Record<K, E>): Map<K, E> {
  const result: Map<K, E> = new Map();
  for (const key in tsEnum) {
    if (!isValidEnumMember(key)) {
      continue;
    }
    result.set(key, tsEnum[key]);
  }
  return result;
}

/**
 * Function used by TS to check the names of enums (isNumericLiteralName)
 *
 * @see https://github.com/Microsoft/TypeScript/blob/89de4c9a3ab3f7f88a141f1529b77628204bff73/lib/tsc.js#L36877
 */
function isValidEnumMember(key: string): boolean {
  return (+key).toString() !== key || key === "Infinity" || key === "-Infinity" || key === "NaN";
}

/**
 * Converts a TS enum and rename options to two maps: from out names to values and from
 * values to out names.
 */
function getEnumMaps<K extends string, E extends AnyKey>(
  tsEnum: Record<K, E>,
  changeCase: CaseStyle | undefined,
  renameAll?: { [P in K]?: string },
): [Map<E, string>, Map<string, E>] {
  const jsToOut: Map<E, string> = new Map();
  const outToJs: Map<string, E> = new Map();

  // TODO: Check for bijection
  for (const [key, value] of tsEnumToMap(tsEnum)) {
    let name: string = key;
    if (renameAll !== undefined && renameAll[key] !== undefined) {
      name = renameAll[key] as string;
    } else if (changeCase !== undefined) {
      name = rename(key, changeCase);
    }
    jsToOut.set(value, name);
    outToJs.set(name, value);
  }
  return [jsToOut, outToJs];
}

export interface TsEnumTypeOptions<E extends AnyKey, EO extends {} = {}> {
  enum: EnumObject<EO, E>;
  changeCase?: CaseStyle;
  rename?: { [P in keyof EO]?: string };
}

/**
 * Represents a TS-style enum value.
 *
 * A TS enum value is defined in an object ("enum object"). It contains "forward"properties from
 * non-numeric strings to strings or numbers and "reversed" properties from numeric strings to
 * keys of forward properties with constant numeric values.
 */
export class TsEnumType<E extends AnyKey = AnyKey, EO extends {} = {}>
implements IoType<E>, TsEnumTypeOptions<E, EO> {
  readonly name: Name = name;
  readonly enum!: Record<keyof EO, E>;
  readonly changeCase?: CaseStyle;
  readonly rename?: { [P in keyof EO]?: string };

  private _jsToOut: Map<E, string> | undefined;
  private _outToJs: Map<string, E> | undefined;

  private _options: Lazy<TsEnumTypeOptions<E>>;

  constructor(options: Lazy<TsEnumTypeOptions<E>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["enum", "changeCase", "rename"]);
    }
  }

  private get jsToOut(): Map<E, string> {
    if (this._jsToOut === undefined) {
      [this._jsToOut, this._outToJs] = getEnumMaps(this.enum, this.changeCase, this.rename);
    }
    return this._jsToOut;
  }

  private get outToJs(): Map<string, E> {
    if (this._outToJs === undefined) {
      [this._jsToOut, this._outToJs] = getEnumMaps(this.enum, this.changeCase, this.rename);
    }
    return this._outToJs;
  }

  read<R>(cx: KryoContext, reader: Reader<R>, raw: R): Result<E, CheckId> {
    return reader.readString(cx, raw, readVisitor({
      fromString: (input: string): Result<E, CheckId> => {
        if (!reader.trustInput && !this.outToJs.has(input)) {
          return writeError(cx, {check: CheckKind.LiteralValue});
        }
        const jsValue = this.outToJs.get(input)!;
        return {ok: true, value: jsValue};
      },
    }));
  }

  write<W>(writer: Writer<W>, value: E): W {
    return writer.writeString(this.jsToOut.get(value)!);
  }

  test(cx: KryoContext | null, value: unknown): Result<E, CheckId> {
    if ((this.jsToOut as Map<unknown, unknown>).has(value)) {
      return {ok: true, value: value as E};
    } else {
      return writeError(cx, {check: CheckKind.LiteralValue});
    }
  }

  equals(val1: E, val2: E): boolean {
    return val1 === val2;
  }

  clone(val: E): E {
    return val;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Error("missing `_options` for lazy initialization");
    }
    const options: TsEnumTypeOptions<E> = typeof this._options === "function" ? this._options() : this._options;

    const tsEnum: EO = options.enum as EO;
    const changeCase: CaseStyle | undefined = options.changeCase;
    const rename: { [P in keyof EO]?: string } | undefined = options.rename;

    Object.assign(this, {enum: tsEnum, changeCase, rename});
  }
}
