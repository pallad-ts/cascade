import {Rule} from "@src/Rule";
import * as sinon from 'sinon';
import {Action} from "@src/Action";
import {IsExact, assert} from 'conditional-type-checks';

function createRule(supports: boolean = true) {
	return {
		supports: sinon.stub().returns(supports),
		run: sinon.stub()
	};
}

describe('Action', () => {
	describe('registering rules', () => {
		it('regular', () => {
			const rule1 = createRule();
			const rule2 = createRule();

			const action = new Action();
			action.registerRule(rule1);
			action.registerRule(rule2);
			action.registerRule(rule1);

			expect(action.hasRule(rule1)).toBe(true);
			expect(action.hasRule(rule2)).toBe(true);
		});

		it.each([
			[[createRule(), createRule()]],
			[new Set([createRule(), createRule(), createRule()])],
		])('from constructor with iterable rules: %s', (rules: Iterable<Rule>) => {
			const action = new Action(rules);

			for (const rule of rules) {
				expect(action.hasRule(rule)).toBe(true);
			}
		});
	});

	describe('calling with context', () => {
		it('passes context to all rules if provided', async () => {
			const rule1 = createRule();
			const rule2 = createRule();
			const action = new Action<'bar'>();
			const context = 'bar' as const;
			const target = {foo: 'bar'};

			action.registerRule(rule1);
			action.registerRule(rule2);
			action.registerRule(rule1);

			await action.run(target, context);

			assert<IsExact<(typeof action)['run'], (target: unknown, context: 'bar') => Promise<void>>>(true);

			sinon.assert.calledWithExactly(rule1.run, target, context);
			sinon.assert.calledWithExactly(rule2.run, target, context);
		});

		it('does not pass context to all rules if context is undefined', async () => {
			const rule1 = createRule();
			const rule2 = createRule();
			const action = new Action<undefined>();
			const target = {foo: 'bar'};

			action.registerRule(rule1);
			action.registerRule(rule2);

			await action.run(target);

			assert<IsExact<(typeof action)['run'], (target: unknown) => Promise<void>>>(true);

			sinon.assert.calledWithExactly(rule1.run, target);
			sinon.assert.calledWithExactly(rule2.run, target);
		});
	});

	describe('running rules', () => {
		let timer: sinon.SinonFakeTimers;
		beforeEach(() => {
			timer = sinon.useFakeTimers();
		});

		afterEach(() => {
			timer.restore();
		});

		it('for rules that supports given target', async () => {
			const rule1 = createRule();
			const rule2 = createRule(false);
			const rule3 = createRule();

			const action = new Action([rule1, rule2, rule3]);

			const target = {foo: 'bar'};

			await action.run(target);

			sinon.assert.calledOnce(rule1.run);
			sinon.assert.calledOnce(rule3.run);
			sinon.assert.notCalled(rule2.run);
		});

		it('rules are called in order and awaits for previous one to finish before moving to next', async () => {
			const rule1 = createRule();
			const rule2 = createRule(false);
			const rule3 = createRule();

			rule1.run.callsFake(() => new Promise(r => setTimeout(r, 2000)));
			rule3.run.callsFake(() => new Promise(r => setTimeout(r, 500)));

			const action = new Action([rule1, rule2, rule3]);
			const target = {foo: 'bar'};

			let isFinished = false;
			const done = () => isFinished = true;
			action.run(target).then(done, done);

			sinon.assert.calledOnce(rule1.run);
			sinon.assert.notCalled(rule3.run);
			expect(isFinished).toBe(false);

			await timer.tickAsync(2100);

			sinon.assert.calledOnce(rule1.run);
			sinon.assert.calledOnce(rule3.run);
			expect(isFinished).toBe(false);

			await timer.tickAsync(1000);
			expect(isFinished).toBe(true);
		});

		it('fails if there are not rules registered for target', () => {
			const action = new Action();
			const target = {foo: 'bar'};

			return expect(action.run(target))
				.rejects
				.toThrowErrorMatchingSnapshot();
		});
	});

	describe('calling in cascade', () => {
		it('runs action for targets (as iterable) returned by other rules', async () => {
			const target1 = {target: 1};
			const target2 = {target: 2};
			const rule1 = createRule(false);
			rule1.supports
				.withArgs(target1)
				.returns(true);

			rule1.run
				.returns([target2]);

			const rule2 = createRule(false);
			rule2.supports
				.withArgs(target2)
				.returns(true);

			const action = new Action<{ foo: 'bar' }>([rule1, rule2]);

			const context = {foo: 'bar'} as const;
			await action.run(target1, context);

			sinon.assert.calledOnce(rule1.run);
			sinon.assert.calledWithExactly(rule1.run, target1, context);

			sinon.assert.calledOnce(rule2.run);
			sinon.assert.calledWithExactly(rule2.run, target2, context);
		});

		it('runs action for target (as iterable) - 3 levels deep', async () => {
			const target1 = {target: 1};
			const target2 = {target: 2};
			const target3 = {target: 3};
			const rule1 = createRule(false);
			rule1.supports
				.withArgs(target1)
				.returns(true);

			rule1.run
				.returns([target2]);

			const rule2 = createRule(false);
			rule2.supports
				.withArgs(target2)
				.returns(true);

			rule2.run
				.withArgs(target2)
				.returns([target3]);

			const rule3 = createRule(false);
			rule3.supports
				.withArgs(target3)
				.returns(true);

			const action = new Action([rule1, rule2, rule3]);

			await action.run(target1);

			sinon.assert.calledOnce(rule1.run);
			sinon.assert.calledWithExactly(rule1.run, target1);

			sinon.assert.calledOnce(rule2.run);
			sinon.assert.calledWithExactly(rule2.run, target2);

			sinon.assert.calledOnce(rule3.run);
			sinon.assert.calledWithExactly(rule3.run, target3);
		});
	});
});
