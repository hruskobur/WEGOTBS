import YarlEmitter from './core/emitter.js';

import * as YarlServer from './server/manager.js';
import ServerEvents from './server/events.js';

import * as YarlRooms from './room/manager.js';
import RoomEvents from './room/events.js';

console.log('... starting initialization');

await YarlRooms.init();
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

YarlRooms.create('room.dev').start();