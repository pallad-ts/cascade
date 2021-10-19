<div align="center">
<h1>Cascade 💣 ➡️ 💥 ➡️ 💥</h1>

<p>Run cascade actions from your code instead database</p>
</div>

---
[![CircleCI](https://circleci.com/gh/pallad-ts/cascade/tree/master.svg?style=svg)](https://circleci.com/gh/pallad-ts/cascade/tree/master)
[![npm version](https://badge.fury.io/js/@pallad%2Fcascade.svg)](https://badge.fury.io/js/@pallad%2Fcascade)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
---

`@pallad/cascade` is a library to run cascade actions on entities.

For example action `delete` on an `Article` entity containing images triggers removal of `Image` entities. If `Image`
entity has anything else to remove as well they might trigger deletion of other entities, and so on and so forth.

# Use cases

* cascade deletion on databases not supporting relations or cascade actions like `DynamoDB`, `MongoDB`, `Redis` etc.
* cascade updates of cached views
* running extra logic on creation of new entries
* achieving cascade logic between multiple persistence models (key/value database <-> filesystem <-> RDBMS etc)
* great for apps that tries to leverage [polyglot persistence](https://www.dataversity.net/utilizing-multiple-data-stores-data-models-polyglot-persistence-worth/)

# Features

* 👷 Built with Typescript
* 📏 Simple but powerful 🔥
* 🧑‍🤝‍🧑 Context friendly for forwarding extra information (like transaction handle)
* ❤️ Integration with `@pallad/modules`

# Community

Join our [discord server](https://discord.gg/Pct8k5DzWr)

# Installation
```shell
npm install @pallad/cascade
```

## Modules
If you already use `alpha-dic` and would like to integrate with `@pallad/modules` install `@pallad/cascade-module`

```shell
npm install @pallad/cascade-module
```

# Why should I use it?

If you can (and want to) handle all cascade actions within a database then great and you probably don't need `@pallad/cascade` at all :)

However it is still a great tool for
* databases that does not support cascade actions like `DynamoDB`, `MongoDB`, `Redis` etc.
* cascade updates of cached views
* running extra logic on creation of new entries
* handling cascade multiple persistence modesl (key/value database <-> filesystem <-> RDBMS etc)
* apps that tries to leverage [polyglot persistence](https://www.dataversity.net/utilizing-multiple-data-stores-data-models-polyglot-persistence-worth/)

# Concepts

The basic conceptions are very simple but it very important to understand them to get in speed with handling cascade
actions.

## Rule

Rule performs an action on a target. It decides whether is able to handle given target, if not
then `Action` will not ask it to handle it.

```typescript
import {Rule} from '@pallad/cascade';

const deleteImageRule: Rule = {
	supports(target) {
		return target instanceof Image;
	},
	run(target: Image): Rule.Result | Promise<Rule.Result> {
		// perform image deletion
		// at this stage we're sure that target is an instanceof Image
		// since otherwise it would not be called
	}
}
```

## Action

Aggregates rules and controls the flow of execution. Once action starts the following steps are being performed:

1. iterates over the rules one by one
2. check if target is supported by the rule (via `supports`). If not then moved to another rule, otherwise calls `run`
   on it.
3. If rule returns a promise then awaits for its resolution.
4. If the final result of rule handling returns anything iterable then action is ran on every target.

## Manager

Just aggregates all actions in one place.

# Examples

## Basic example

```typescript
import {Rule} from '@pallad/cascade';

class Article {
	id!: string;
	images!: Image[];
}

class Image {
	id!: string;
}

const deleteArticleRule: Rule = {
	supports(target) {
		return target instanceof Article;
	},
	run(target: Article) {
		console.log('Removing article', target.id);

		return target.images;
	}
}
const deleteImageRule: Rule = {
	supports(target) {
		return target instanceof Image;
	},
	run(target: Image) {
		console.log('Removing image', target.id);
	}
}
const deleteAction = new Action([
	deleteArticleRule,
	deleteImageRule
]);

const article = Object.assign(new Article, {
	id: 'a1',
	images: [
		Object.assign(new Image(), {id: 'i1'}),
		Object.assign(new Image(), {id: 'i2'}),
	]
});
deleteAction.run(article);

// Removing article a1
// Removing image i1
// Removing image i2
```

## More entities + counter invalidation

A little bit more advanced with more entity types and articles counter invalidation. Note the order of execution:

1) First `Stash` is being deleted
2) then `Article` with id: `a1`
3) then images for that article
4) then `Article` with id: `a2`
5) and so on and so forth

```typescript
import {Rule, Action} from '@pallad/cascade';

class Article {
	id!: string;
	images!: Image[];
}

class Image {
	id!: string;
}

class Stash {
	id!: string;
	entries!: Article[];
}

const deleteArticleRule: Rule = {
	supports(target) {
		return target instanceof Article;
	},
	run(target: Article) {
		console.log('Removing article', target.id);
		return target.images;
	}
}
const deleteImageRule: Rule = {
	supports(target) {
		return target instanceof Image;
	},
	run(target: Image) {
		console.log('Removing image', target.id);
	}
}

const deleteStashRule: Rule = {
	supports(target) {
		return target instanceof Stash;
	},
	run(target: Stash) {
		console.log('Removing stash', target.id);
		return target.entries;
	}
}

const updateArticlesCounterRule: Rule = {
	supports(target) {
		return target instanceof Article;
	},
	run(target: Article) {
		console.log('Updating articles counter of', target.id);
	}
}
const deleteAction = new Action([
	deleteArticleRule,
	deleteImageRule,
	deleteStashRule,
	updateArticlesCounterRule,
]);

const article1 = Object.assign(new Article, {
	id: 'a1',
	images: [
		Object.assign(new Image(), {id: 'i1'}),
		Object.assign(new Image(), {id: 'i2'}),
	]
});

const article2 = Object.assign(new Article, {
	id: 'a1',
	images: [
		Object.assign(new Image(), {id: 'i3'}),
		Object.assign(new Image(), {id: 'i4'}),
	]
});

const stash = Object.assign(new Stash, {
	id: 's1',
	entries: [article1, article2]
});

deleteAction.run(stash);

// Removing stash s1
// Removing article a1
// Removing image i1
// Removing image i2
// Updating articles counter of a1
// Removing article a1
// Removing image i3
// Removing image i4
// Updating articles counter of a1
```

## Wrapping in transactions

```typescript
import {Rule, Action} from '@pallad/cascade';
import {Knex} from 'knex';

interface DeleteActionContext {
	transaction: Knex.Transaction;
}

class Article {
	id!: string;
	images!: Image[];
}

class Image {
	id!: string;
}

const deleteArticleRule: Rule<DeleteActionContext> = {
	supports(target) {
		return target instanceof Article;
	},
	run(target: Article, context) {
		console.log('Removing article', target.id);
		// now you 
		context.transaction('articles').delete().where('id', target.id);
		return target.images;
	}
}
const deleteImageRule: Rule<DeleteActionContext> = {
	supports(target) {
		return target instanceof Image;
	},
	run(target: Image, context) {
		console.log('Removing image', target.id);
		context.transaction('images').delete().where('id', target.id);
	}
}

const deleteAction = new Action<DeleteActionContext>([
	deleteArticleRule,
	deleteImageRule,
]);

const article = Object.assign(new Article, {
	id: 'a1',
	images: [
		Object.assign(new Image(), {id: 'i1'}),
		Object.assign(new Image(), {id: 'i2'}),
	]
});

const transaction = knex.transaction()

knex.transaction((trx) => {
	return deleteAction.run(article, {
		transaction: trx
	});
});

// Removing article a1
// Removing image i1
// Removing image i2
```

# Tips

## How to distinguish targets if my entities are just pure javascript objects (POJO)?
You have to wrap them within extra object to indicate its type or use [`@pallad/entity-ref`](https://github.com/pallad-ts/entity-ref)

