import {setupEngine} from "./fixtures/setupEngine";
import {Definition} from "alpha-dic";
import {actionRuleAnnotation} from "@src/actionRuleAnnotation";
import {Module} from "@src/Module";
import {StandardActions} from "@pallad/modules";
import {Manager, Rule} from "@pallad/cascade";


function createActionRule(actionName: string) {
	const value = new class implements Rule {
		run(...args: [unknown]): Rule.Result | Promise<Rule.Result> {
			return undefined;
		}

		supports(target: unknown): boolean {
			return false;
		}
	};

	const definition = new Definition()
		.useValue(value)
		.annotate(actionRuleAnnotation(actionName));

	return {definition, value};
}

describe('Module', () => {
	it('infers actions from found rules and registers them to corresponding actions', async () => {
		const {container, engine, module} = setupEngine();

		const a11 = createActionRule('action1');
		const a12 = createActionRule('action1');
		const a21 = createActionRule('action2');
		const a31 = createActionRule('action3');
		container.registerDefinition(a11.definition)
			.registerDefinition(a12.definition)
			.registerDefinition(a21.definition)
			.registerDefinition(a31.definition);

		await engine.runAction(StandardActions.INITIALIZATION);

		const manager = await module.getManager(container);

		expect(Array.from(manager.getActions().keys()))
			.toEqual(['action1', 'action2', 'action3']);

		expect(manager.assertAction('action1').hasRule(a11.value))
			.toBeTruthy();
		expect(manager.assertAction('action1').hasRule(a12.value))
			.toBeTruthy();
		expect(manager.assertAction('action2').hasRule(a21.value))
			.toBeTruthy()
		expect(manager.assertAction('action3').hasRule(a31.value))
			.toBeTruthy();
	});

	it('using custom manager', async () => {
		const manager = new Manager();
		const {container, engine, module} = setupEngine(
			new Module({manager})
		);
		const a11 = createActionRule('action1');
		container.registerDefinition(a11.definition);

		await engine.runAction(StandardActions.INITIALIZATION);

		const managerInstance = await module.getManager(container);

		expect(managerInstance === manager)
			.toBeTruthy();

		expect(managerInstance.hasAction('action1'))
			.toBeTruthy();
	});
});