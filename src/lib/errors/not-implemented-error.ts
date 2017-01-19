import {Incident} from "incident";

/**
 * Interface for the `.data` property of `NotImplementedError`.
 */
export interface NotImplementedErrorData {
  /**
   * A message describing the planned feature.
   */
  message: string;
}

/**
 * This error signals that a feature is planned but not yet implemented.
 *
 * Contributions to fix these errors are greatly appreciated.
 */
export class NotImplementedError extends Incident<NotImplementedErrorData> {
  /**
   * @param message A message describing the planned feature.
   */
  constructor(message: string) {
    super(
      "not-implemented",
      {message: message},
      `You are trying to use a feature that is planned but not yet implemented: ${message}`
    );
  }
}
