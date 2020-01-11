import {Rule} from "./Rule";

export class Action<T = any> {
    private rules: Set<Rule> = new Set();

    registerRule(rule: Rule): this {
        this.rules.add(rule);
        return this;
    }

    async run(target: T) {
        for (const rule of this.getRulesForTarget(target)) {
            await rule.run(target);
            const relatedTargets = rule.getRelated(target);
            if (!Array.isArray(relatedTargets)) {
                continue;
            }
            for (const target of relatedTargets) {
                await this.run(target);
            }
        }
    }

    private getRulesForTarget(target: T) {
        return Array.from(this.rules)
            .filter(rule => rule.supports(target));
    }
}