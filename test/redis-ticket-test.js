const should = require('should');
const redis = require('redis');
const promisify = require("util").promisify;
const redisClient = redis.createClient();
const RedisTicket = require('../index');

redisClient.on("error", function(error) {
    console.error(error);
});

describe('RedisTicket', function () {
    const prefix = 'r-ticket:';
    const ticketStore = new RedisTicket({
        prefix: prefix,
        port: 6379
    });
    before(async function () {
        const keys = await promisify(redisClient.keys).bind(redisClient)('r-ticket:*');

        for (let i = 0; i < keys.length; i++) {
            await promisify(redisClient.del).bind(redisClient)(keys[i]);
        }
    });

    it('should allow setting tickets', async function () {
        const key = 'testkey1';
        await ticketStore.set(key, {userId: '1234'});
        const val = await promisify(redisClient.get).bind(redisClient)(prefix + key);

        should.exist(val)
        await promisify(redisClient.del).bind(redisClient)(prefix + key);
    });

    it('should allow getting tickets', async function () {
        const key = 'testkey2';
        await ticketStore.set(key, {userId: '2345'});
        const user = await ticketStore.get(key);

        should.exist(user);
        user.userId.should.equal('2345');

        await promisify(redisClient.del).bind(redisClient)(prefix + key);
    });

    it('should not allow setting more than one ticket with the same key', async function () {
        const key = 'testkey3';
        await ticketStore.set(key, {userId: '3456'});

        let err;
        try {
            await ticketStore.set(key, {userId: 'asdf'});
        } catch (e) {
            err = e;
        }

        err.should.be.error;

        const val = await promisify(redisClient.get).bind(redisClient)(prefix + key);

        should.exist(val);
        JSON.parse(val).userId.should.equal('3456');

        promisify(redisClient.del).bind(redisClient)(prefix + key);
    });

    it('should remove tickets after first "get"', async function () {
        const key = 'testkey4';
        await ticketStore.set(key, {userId: '4567'});
        const user = await ticketStore.get(key);

        const val = await promisify(redisClient.get).bind(redisClient)(key);

        should.not.exist(val);
    });

});
