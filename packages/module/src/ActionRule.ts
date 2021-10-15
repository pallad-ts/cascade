import {Service, ServiceName} from "alpha-dic";
import {actionRuleAnnotation} from "./actionRuleAnnotation";
import {Rule} from "@pallad/cascade";

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ActionRule(actionName: string, name?: ServiceName) {
	return function (clazz: { new(...args: any[]): Rule }) {
		Service(name)(clazz);
		actionRuleAnnotation.decorator(actionName);
	}
}