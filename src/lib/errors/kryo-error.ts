import {Incident} from "incident";

/**
 * This is the base class for all the custom errors of Kryo.
 *
 * @param <D> The type of the `.data` property of the error.
 */
export class KryoError<D> extends Incident<D> {
}
