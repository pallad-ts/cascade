export function actionRuleAnnotation(actionName: string): Annotation {
    return {
        name: NAME,
        actionName
    };
}

const NAME = '@pallad/cascade/rule';

export interface Annotation {
    name: string,
    actionName: string;
}

export function getRulePredicate(actionName: string) {
    return (a: any) => a && a.name === NAME && a.actionName === actionName;
}