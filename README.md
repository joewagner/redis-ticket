# Redis Ticket

simple implementation of a single use "ticket". This module exposes key: value `set` and `get` methods. key must be a String, and value can be anything.  The `get` method returns the value then deletes the key:value from the store. This is useful for building 3 party ticket based authentication tools.

## Installation

`npm install redis-ticket`

## Options

  - redis: passed directy to (Node Redis)[https://www.npmjs.com/package/redis]
  - prefix: value that is prefixed to all keys, default is 'r-ticket:'.  If you don't want a prefix specify the empty string, i.e. `prefix: ''`

## Example

```
const RedisTicket = require('redis-ticket');

const ticketStore = new RedisTicket({
    // NOTE: for most cases should not have to specify any options
    prefix: 'socket-tickets:',
    port: 6379
});

// ...

    // after authenticating `user`
    const key = getUUID(); // function that returns a universally unique ID, e.g. UUID V4
    await ticketStore.set(key, {_id: user._id});

// elsewhere..
io.use(function (socket, next) {
    // already authenticated
    if (socket.user) return next();

    var ticket = socket.handshake.query && socket.handshake.query.authticket;
    if (ticket) {
        const user = await ticketStore.get(ticket);
        const userId = user && user._id

        // get user from db and attach to socket...
```
