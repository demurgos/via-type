export interface Type<T> {
  name: string;
  testError (val: T): Error | undefined;
  test (val: T): boolean;
  equals (val1: T, val2: T): boolean;
  clone (val: T): T;
  toJSON(): any;
}

export interface SerializableType<T, FormatName extends string, Input, Output extends Input> extends Type<T> {
  readTrusted (format: FormatName, serialized: Output): T;
  read (format: FormatName, serialized: Input): T;
  write (format: FormatName, val: T): Output;
}

export interface VersionedType<T, Input, Output extends Input, Diff>
  extends SerializableType<T, "json", Input, Output> {
  /**
   * Returns undefined if both values are equivalent, otherwise a diff representing the change from
   * oldVal to newVal.
   *
   * @param oldVal The old value
   * @param newVal The new value
   */
  diff (oldVal: T, newVal: T): Diff | undefined;
  patch (oldVal: T, diff: Diff | undefined): T;
  reverseDiff (diff: Diff | undefined): Diff | undefined;
  squash (oldDiff: Diff | undefined, newDiff: Diff | undefined): Diff | undefined;
  // readonly diffType: Type<Diff>;
}

export interface CollectionType <T, D, I> extends Type<T> {
  iterateSync (value: T, visitor: (item: I) => any): void;
}

// tslint:disable-next-line:max-line-length
// export interface VersionedCollectionType<T, S, D, I> extends CollectionType <T, D, I>, VersionedType<T, S, D> {
//   isCollection: true;
//   isVersioned: true;
//   isSerializable: true;
// }
