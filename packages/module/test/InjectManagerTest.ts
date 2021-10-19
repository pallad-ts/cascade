import {createStandard, Service} from "alpha-dic";
import {Engine, StandardActions} from "@pallad/modules";
import {Manager} from "@pallad/cascade";
import {setupEngine} from "./fixtures/setupEngine";
import {InjectManager} from '@src/InjectManager';

describe('InjectManager', () => {
	it('should inject instance of manager', async () => {
		const {container, engine} = setupEngine();

		await engine.runAction(StandardActions.INITIALIZATION);

		@Service('test')
		class Foo {
			constructor(@InjectManager() readonly manager: Manager) {
			}
		}

		const instance = await container.get<Foo>('test');
		expect(instance.manager)
			.toBeInstanceOf(Manager);
	});
});
