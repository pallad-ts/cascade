import {Inject} from "alpha-dic";
import {Module} from "./Module";

export function InjectCascadeAction(actionName: string) {
    return Inject(Module.getServiceNameForAction(actionName));
}