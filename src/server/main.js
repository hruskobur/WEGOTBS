/* imports ********************************************************************/
import YarlWebSocketServer from './wss.js';
import Simulation from './simulation.js';

/* app ************************************************************************/
const simulation = new Simulation().start();

const server = new YarlWebSocketServer(
    {
        http: {
            noDelay: true
        },
        wss: {},
        host: '127.0.0.1',
        port: 11000
    }
)
.on(YarlWebSocketServer.Events.AppJoin, simulation.join)
.on(YarlWebSocketServer.Events.AppLeave, simulation.leave);

await server.start();