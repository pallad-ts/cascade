import {Annotation, Service, ServiceName} from "alpha-dic";
import {actionRuleAnnotation} from "./actionRuleAnnotation";

export function ActionRule(actionName: string, name?: ServiceName) {
    return function (clazz: { new(...args: any[]): any }) {
        Service(name)(clazz);
        Annotation(actionRuleAnnotation(actionName))(clazz);
    }
}