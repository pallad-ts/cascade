---
sidebar_position: 8
---

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

## Wrapping in transactions {#transaction}

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