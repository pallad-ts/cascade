import {Module as _Module, StandardActions} from '@pallad/modules';
import {Container, onActivation} from "alpha-dic";
import {Action, Manager} from "@pallad/cascade";
import {actionRuleAnnotation, getRulePredicateForAction} from "./actionRuleAnnotation";
import {actionAnnotation, getActionPredicate} from "./actionAnnotation";
import {managerAnnotation} from "./managerAnnotation";
import {managerReference} from "./references";

export class Module extends _Module<{ container: Container }> {
	private options: Module.Options;

	constructor(options?: Module.Options.FromUser) {
		super('@pallad/cascade-module');

		this.options = {
			manager: options?.manager ?? new Manager()
		};
	}

	init(): void {
		this.registerAction(StandardActions.INITIALIZATION, ({container}) => {
			const actionNames = this.inferActionNamesFromContainer(container);
			for (const actionName of actionNames) {
				container.definitionWithConstructor(Action)
					.annotate(actionAnnotation(actionName))
					.annotate(onActivation(async (action: Action) => {
						const rules = await container.getByAnnotation(getRulePredicateForAction(actionName));
						for (const rule of rules) {
							action.registerRule(rule);
						}
						return action;
					}));
			}

			container.definitionWithValue(this.options.manager)
				.annotate(managerAnnotation())
				.annotate(onActivation(async (manager: Manager) => {
					for (const actionName of actionNames) {
						const [action] = await container.getByAnnotation(getActionPredicate(actionName));
						manager.registerAction(actionName, action);
					}
					return manager;
				}));
		});
	}

	private inferActionNamesFromContainer(container: Container) {
		const rulesDefinitions = container.findByAnnotation(actionRuleAnnotation.predicate, true);
		const actionNames = new Set<string>();
		for (const [, annotation] of rulesDefinitions) {
			actionNames.add(annotation.actionName);
		}
		return actionNames;
	}

	getManager<T>(container: Container) {
		return managerReference.getArgument(container) as Promise<Manager>;
	}
}

export namespace Module {
	export interface Options {
		/**
		 * Instance of manager to create
		 */
		manager: Manager;
	}

	export namespace Options {
		export type FromUser = Partial<Options>;
	}
}