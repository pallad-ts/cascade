import {Action} from "./Action";
import {CascadeError} from "./CascadeError";

/**
 * Aggregates
 *
 * @public
 */
export class Manager {
	private actions = new Map<string, Action<unknown>>();

	/**
	 * Registers new action
	 */
	registerAction(name: string, action: Action<unknown>): this {
		this.actions.set(name, action);
		return this;
	}

	getActions() {
		return this.actions;
	}

	getAction<TAction extends Action = Action>(name: string): TAction | undefined {
		return this.actions.get(name) as TAction | undefined;
	}

	/**
	 * Returns action if exists. Otherwise throws an error
	 */
	assertAction<TAction extends Action = Action>(name: string): TAction {
		const action = this.getAction<TAction>(name);
		if (!action) {
			throw new CascadeError(`Action "${name}" does not exist`);
		}
		return action;
	}

	/**
	 * Checks if action with given name exists
	 */
	hasAction(name: string) {
		return this.actions.has(name);
	}
}