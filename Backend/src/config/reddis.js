const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-17408.c305.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 17408
    }
});

module.exports = redisClient;
