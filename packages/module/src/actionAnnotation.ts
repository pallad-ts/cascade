import {createAnnotationFactory} from "alpha-dic";

export const actionAnnotation = createAnnotationFactory('@pallad/cascade/action', (actionName: string) => ({actionName}));

export function getActionPredicate(actionName: string) {
	return actionAnnotation.andPredicate((value: ReturnType<typeof actionAnnotation>) => {
		return value.actionName === actionName;
	})
}
