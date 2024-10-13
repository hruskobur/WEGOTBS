import YarlEmitter from './core/emitter.js';
import * as YarlRooms from './room/manager.js';
import * as YarlClients from './client/manager.js';
import * as YarlServer from './server/manager.js';

console.log('... starting initialization');

await YarlRooms.init();
await YarlClients.init();
await YarlServer.init(
    {
        http: {
            noDelay: true
        },
        wss: {},
        host: '127.0.0.1',
        port: 11000
    }
);

console.log('... initialization finished');

console.log('... create dev room');

YarlRooms.create('dev').start();