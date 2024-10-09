/* imports ********************************************************************/
import YarlServer from './wss/server.js';
import SimulationManager from './simulation/manager.js';

/* app ************************************************************************/
const simulation = new SimulationManager();
simulation.create_default(true);

const server = new YarlServer(
    {
        http: {
            noDelay: true
        },
        wss: {},
        host: '127.0.0.1',
        port: 11000
    }
);
server.on(YarlServer.Events.Connected, simulation.join)
server.on(YarlServer.Events.Disconnected, simulation.leave);
server.on(YarlServer.Events.Shutdown, () => {
    simulation.simulations.forEach(s => s.stop())
});

await server.start();

/* sandbox ********************************************************************/
let shutdown_in = 10000;
let interval = setInterval(() => {
    shutdown_in -= 1000;

    if(shutdown_in <= 0) {
        clearInterval(interval);
        server.stop();

        return;
    }

    server.broadcast(`shutdown in: ${shutdown_in}`);


}, 1000)