import YarlClient from '../ws/client.js';
import Simulation from './simulation.js';
import { v4 as uuidv4 } from 'uuid';

class SimulationManager {
    /**
     * @type {Map<String, Simulation>}
     */
    simulations;

    /**
     * Dev only!
     * Default simulation's uuid.
     * @type {String}
     */
    dev_uuid;

    constructor () {
        this.simulations = new Map();
    }

    /**
     * Dev only!
     * Creates and adds single instance to the map.
     * @public
     * @param {Boolean} autostart
     * @returns {Simulation}
     */
    create_default = (autostart) => {
        this.dev_uuid = 'dev.sim.0';
        const simulation = new Simulation(
            // uuidv4()
            this.dev_uuid
        );

        this.simulations.set(
            simulation.uuid,
            simulation
        );

        if(autostart === true) {
            simulation.start();
        }

        return simulation;
    }

    /**
     * 
     * @param {YarlClient} client 
     * @param {String} uuid
     */
    join = (client, uuid) => {
        // todo: welp, this function 
        if(client.simulation !== null) {
            client.kick();

            return;
        }

        const simulation = this.simulations.get(uuid);
        if(simulation == null) {
            client.kick();

            return;
        }

        if(simulation.clients.has(client.uuid) === true) {
            client.kick();

            return;
        }

        // todo: free-space will be a getter that compares model's restrictions
        // and current clints size
        if(simulation.clients.size >= 10) {
            client.kick();
            return;
        }

        simulation.clients.set(client.uuid, client);
        client.simulation = simulation;

        console.log('join', simulation.uuid, client.uuid);
    }

    /**
     * 
     * @param {YarlClient} client 
     */
    leave = (client) => {
        const simulation = client.simulation;
        if(simulation === null) {
            client.kick();

            return;
        }

        if(simulation.clients.has(client.uuid) === false) {
            client.kick();

            return;
        }

        simulation.clients.delete(client.uuid);
        client.simulation = null;

        console.log('leave', simulation.uuid, client.uuid);
    }
}

export default SimulationManager;