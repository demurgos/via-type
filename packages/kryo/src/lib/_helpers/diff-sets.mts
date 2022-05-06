export interface DiffSetsResult<T> {
  commonKeys: Set<T>;
  missingKeys: Set<T>;
  extraKeys: Set<T>;
}

export function diffSets<T>(reference: Iterable<T>, values: Iterable<T>): DiffSetsResult<T> {
  const referenceSet: Set<T> = new Set<T>(reference);
  const valuesSet: Set<T> = new Set<T>(values);
  const all: Set<T> = new Set<T>([...referenceSet, ...valuesSet]);
  const commonKeys: Set<T> = new Set<T>();
  const missingKeys: Set<T> = new Set<T>();
  const extraKeys: Set<T> = new Set<T>();

  for (const key of all) {
    if (!valuesSet.has(key)) {
      missingKeys.add(key);
    } else if (!referenceSet.has(key)) {
      extraKeys.add(key);
    } else {
      commonKeys.add(key);
    }
  }

  return {commonKeys, missingKeys, extraKeys};
}
