import {Module as _Module, StandardActions} from '@pallad/modules';
import {Container, onActivation, reference} from "alpha-dic";
import {Action} from "@pallad/cascade";
import {getRulePredicate} from "./actionRuleAnnotation";

export class Module extends _Module<{ container: Container }> {
    constructor(private actionNames: string[]) {
        super('@pallad/cascade-module');
    }

    init(): void {
        this.registerAction(StandardActions.INITIALIZATION, context => {
            for (const actionName of this.actionNames) {
                context.container.definitionWithConstructor(Module.getServiceNameForAction(actionName), Action)
                    .annotate(onActivation(async function (this: Container, action: Action) {
                        const rules = await this.getByAnnotation(getRulePredicate(actionName));
                        for (const rule of rules) {
                            action.registerRule(rule);
                        }
                        return action;
                    }));
            }
        });
    }

    static getServiceNameForAction(actionName: string) {
        return `@pallad/cascade/action/${actionName}`;
    }

    static getReferenceToAction(actionName: string) {
        return reference(Module.getServiceNameForAction(actionName));
    }
}