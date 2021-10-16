---
sidebar_position: 15
---

# FAQ

## Why should I use `@pallad/cascade` instead of database cascade?

If you can handle all cascade actions within a database then great and you probably don't need `@pallad/cascade` at all :)

However it is still a great tool for 
* databases that does not support cascade actions like `DynamoDB`, `MongoDB`, `Redis` etc.
* cascade updates of cached views
* running extra logic on creation of new entries
* handling cascade multiple persistence modesl (key/value database <-> filesystem <-> RDBMS etc)
* apps that tries to leverage [polyglot persistence](https://www.dataversity.net/utilizing-multiple-data-stores-data-models-polyglot-persistence-worth/)

## Can I run an action rules within a transaction?

Sure, use [action context](./examples.md#transaction) for that.
