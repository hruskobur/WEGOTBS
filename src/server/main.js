import { YarlLogInit } from './core/logger.js';

import * as YarlServer from './server/manager.js';
import * as YarlRooms from './room/manager.js';

YarlLogInit('json');
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
YarlRooms.create('room.dev').start();