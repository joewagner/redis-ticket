# Redis Ticket

simple implementation of a single use "ticket". This module exposes key: value `set` and `get` methods. key must be a String, and value can be anything.  The `get` method returns the value then deletes the key:value from the store. This is useful for building 3 party ticket based authentication tools.

## Installation

`npm install redis-ticket`

## Options

options are passed directy to (Node Redis)[https://www.npmjs.com/package/redis]