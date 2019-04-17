const bunyan = require('bunyan');

// const log = bunyan.createLogger({'name':'bing_bg'});
exports.log =  bunyan.createLogger({
    name: 'Bing_BG',                     // Required
    level: 0,      // Optional, see "Levels" section
    streams: [
        { stream: process.stderr, level: "error" },
        { stream: process.stdout, level: "debug" }
    ],           // Optional, see "Streams" section
    src: true,
});

// log.info('info');
// log.debug('debug');
// log.error('error');