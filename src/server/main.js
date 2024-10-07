/* imports ********************************************************************/
import YarlWebSocketServer from './wss.js';

/* app ************************************************************************/

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
// .on(YarlWebSocketServer.Events.Join, simulation.join)
// .on(YarlWebSocketServer.Events.Leave, simulation.leave);

// simulation.start();
await server.start();

setTimeout(async () => {
    console.log('stopped');
    await server.stop();
}, 5000);
