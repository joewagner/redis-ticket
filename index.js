const redis = require('redis');
const promisify = require("util").promisify;

const RedisTicket = function (options) {
    const redisOptions = options && options.redis;
    this.prefix = (options && options.prefix) || 'r-ticket:'
    this.client = redis.createClient(redisOptions);
};

RedisTicket.prototype.set = async function (key, val) {
    try {
        if (typeof val === 'undefined') throw new Error('RedisTicket: value must be defined');
        if (typeof key === 'undefined') throw new Error('RedisTicket: key must be defined');

        const _key = this.prefix + key;

        const _val = typeof val === 'string' ? val : JSON.stringify(val);
        const exists = await promisify(this.client.get).bind(this.client)(_key);

        if (exists) {
            throw new Error('RedisTicket: Cannot have two tickets with the same key');
        }

        await promisify(this.client.set).bind(this.client)(_key, _val);
    } catch (err) {
        return Promise.reject(err);
    }
};

RedisTicket.prototype.get = function (key) {
    if (typeof key === 'undefined') return Promise.reject(new Error('RedisTicket: key must be defined'));

    const _key = this.prefix + key;
    return new Promise((resolve, reject) => {
        this.client
        .multi()
        .get(_key)
        .del(_key)
        .exec(function(err, replies) {
            if (err) return reject(err);

            let val;
            try {
                val = JSON.parse(replies[0]);
            } catch (err) {
                val = replies[0]
            }
            resolve(val);
        });
    });
};

module.exports = RedisTicket;
