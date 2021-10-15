import {Module} from "@src/Module";
import {createStandard} from "alpha-dic";
import {Engine} from "@pallad/modules";

export function setupEngine(module: Module = new Module()) {
	const container = createStandard();

	const engine = new Engine({container});
	engine.registerModule(module);

	return {engine, container, module};
}