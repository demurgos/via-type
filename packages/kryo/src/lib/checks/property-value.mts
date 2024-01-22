import {CheckId} from "../index.mjs";
import {CheckKind} from "./check-kind.mjs";

export interface PropertyValueCheck {
  readonly check: CheckKind.PropertyValue,
  readonly children: [CheckId];
}

export function formatPropertyValueCheck(): string {
  return "record property value must be valid";
}
