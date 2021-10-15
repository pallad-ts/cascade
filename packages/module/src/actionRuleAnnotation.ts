import {createAnnotationFactory} from "alpha-dic";

export const actionRuleAnnotation = createAnnotationFactory(
	'@pallad/cascade/rule',
	(actionName: string) => ({actionName})
);

export function getRulePredicateForAction(actionName: string) {
	return actionRuleAnnotation.andPredicate((value: ReturnType<typeof actionRuleAnnotation>) => {
		return value.actionName === actionName;
	});
}