import {StandardActions} from "@pallad/modules";
import {managerReference} from "@src/references";
import {Manager} from "@pallad/cascade";
import {setupEngine} from "./fixtures/setupEngine";

describe('references', () => {
	describe('manager', () => {
		it('allows to get manager', async () => {
			const {container, engine} = setupEngine();

			await engine.runAction(StandardActions.INITIALIZATION);

			const result = await managerReference.getArgument(container)
			expect(result)
				.toBeInstanceOf(Manager);
		});
	});
});
