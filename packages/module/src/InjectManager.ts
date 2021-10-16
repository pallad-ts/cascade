import {Inject} from "alpha-dic";
import {managerReference} from "./references";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function InjectManager() {
	return Inject(managerReference)
}