import {Inject, reference} from "alpha-dic";
import {actionAnnotation, getActionPredicate} from "./actionAnnotation";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function InjectAction(actionName: string) {
	return Inject(reference.annotation(getActionPredicate(actionName)));
}