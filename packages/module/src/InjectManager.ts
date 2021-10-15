import {Inject} from "alpha-dic";
import {managerReference} from "./references";

export function InjectManager() {
	return Inject(managerReference)
}