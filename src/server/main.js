/* imports ********************************************************************/
import YarlWebSocketServer from './wss.js';
import Simulation from './simulation.js';

/* app ************************************************************************/
const simulation = new Simulation();
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
.on(YarlWebSocketServer.Events.Join, simulation.join)
.on(YarlWebSocketServer.Events.Leave, simulation.leave);

// simulation.start();
await server.start();