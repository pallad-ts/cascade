/**
 * @public
 */
export interface Rule<TContext = undefined> {
	/**
	 * Tells if given target is supported by rule
	 */
	supports(target: unknown): boolean;

	/**
	 * Run action on given target and return related targets
	 */
	run(...args: TContext extends undefined ? [unknown] : [unknown, TContext]): Rule.Result | Promise<Rule.Result>;
}

/**
 * @public
 */
export namespace Rule {
	export type Result = void | Iterable<any>;
}