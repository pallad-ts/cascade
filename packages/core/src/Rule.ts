export interface Rule<T = any> {
    /**
     * Tells if given target is supported by rule
     *
     * @param target
     */
    supports(target: T): boolean;

    /**
     * Run action on given target and return related targets
     * @param target
     */
    run(target: T): Rule.Result | Promise<Rule.Result>;
}

export namespace Rule {
    export type Result = void | any[];
}