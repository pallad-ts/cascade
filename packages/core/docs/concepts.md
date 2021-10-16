---
sidebar_position: 2
---

# Concepts

The basic conceptions are very simple but it very important to understand them to get in speed with handling cascade
actions.

## Elements
### Rule

Rule is an object that performs an action on a target. Rule decides whether is able to handle given target, if not
then `Action` will not ask it to handle it.

```typescript
import {Rule} from '@pallad/cascade';

const deleteImageRule: Rule = {
	supports(target) {
		return target instanceof Image;
	},
	run(target: Image): Rule.Result | Promise<Rule.Result> {
		// perform image deletion
		// at this stage we're sure that target is an instanceof Image since otherwise it would not be called
	}
}
```

### Action

Aggregates rules and controls the flow of execution. Once action starts the following steps are being performed:

1. iterates over the rules one by one
2. check if target is supported by the rule (via `supports`). If not then moved to another rule, otherwise calls `run`
   on it.
3. If rule returns a promise then awaits for its resolution.
4. If the final result of rule handling returns anything iterable then action is ran on every target.

### Manager

Just aggregates all actions in one place.