import {Rule} from "./Rule";

function isIterable(target: any): target is Iterable<any> {
	return target && typeof target[Symbol.iterator] === 'function';
}

export class Action<TContext = undefined> {
	private rules: Set<Rule<TContext>> = new Set();

	constructor(rules?: Iterable<Rule<TContext>>) {
		if (rules && isIterable(rules)) {
			for (const rule of rules) {
				this.registerRule(rule);
			}
		}
	}

	registerRule(rule: Rule<TContext>): this {
		this.rules.add(rule);
		return this;
	}

	hasRule(rule: Rule<TContext>): boolean {
		return this.rules.has(rule);
	}

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