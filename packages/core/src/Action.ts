import {Rule} from "./Rule";

function isIterable(target: any): target is Iterable<any> {
	return target && typeof target[Symbol.iterator] === 'function';
}

/**
 * Main action class responsible for aggregating rules and controlling flow of execution
 * @typeParam TContext - type of context provided to action all rules. If it is other than undefined then providing context is required
 * @public
 */
export class Action<TContext = undefined> {
	private rules: Set<Rule<TContext>> = new Set();

	/**
	 * @param rules - iterable of rules to register
	 */
	constructor(rules?: Iterable<Rule<TContext>>) {
		if (rules && isIterable(rules)) {
			for (const rule of rules) {
				this.registerRule(rule);
			}
		}
	}

	/**
	 * Registers a rule
	 * Note that registering the rule that is already registered have no effect
	 */
	registerRule(rule: Rule<TContext>): this {
		this.rules.add(rule);
		return this;
	}

	/**
	 * Checks if rule is already registered
	 */
	hasRule(rule: Rule<TContext>): boolean {
		return this.rules.has(rule);
	}

	/**
	 * Runs action
	 * @param target - target of action
	 * @param context - optional context, if `TContext` generic is other than undefined then providing context is required
	 */
	async run(...args: TContext extends undefined ? [unknown] : [unknown, TContext]) {
		const [target, context] = args;
		for (const rule of this.getRulesForTarget(target)) {
			const relatedTargets = await rule.run(...args);
			if (!isIterable(relatedTargets)) {
				continue;
			}
			for (const target of relatedTargets) {
				const newArgs = context === undefined ? [target] : [target, context];
				await this.run(...newArgs as any);
			}
		}
	}

	private getRulesForTarget(target: unknown) {
		return Array.from(this.rules)
			.filter(rule => rule.supports(target));
	}
}