---
slug: "/"
sidebar_position: 1
---

# Introduction

`@pallad/cascade` is a library to run cascade actions on targets (might be anything distinguishable for you). Every
action might return an iterable (`Set`, `array` or etc) of other targets on which the same action to run.

For example action `delete` on an `Article` entity containing images triggers removal of `Image` entities. If `Image`
entity has anything else to remove as well they might trigger deletion of other entities, and so on and so forth.

## Use cases

* cascade deletion on databases not supporting relations or cascade actions like `DynamoDB`, `MongoDB`, `Redis` etc.
* cascade updates of cached views
* running extra logic on creation of new entries
* achieving cascade logic between multiple persistence models (key/value database <-> filesystem <-> RDBMS etc)
* great for apps that tries not to lock to single persistence model

## Features

* 👷 Built with Typescript
* 📏 Simple but very powerful
* 🧑‍🤝‍🧑 Context friendly for forwarding extra information (like transaction handle)
* ❤️ Integration with `@pallad/modules`