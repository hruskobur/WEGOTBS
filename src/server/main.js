/* imports ********************************************************************/
import YarlWebSocketServer from './wss.js';
import Simulation from './simulation/simulation.js';

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
);
server.on(YarlWebSocketServer.Events.Join, simulation.join)
server.on(YarlWebSocketServer.Events.Leave, simulation.leave);
// server.on(YarlWebSocketServer.Events.Shutdown, () => {});

simulation.start();
await server.start();