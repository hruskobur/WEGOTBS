import PhaseModel from '../model/phase.js';
import TimeModel from '../model/time.js';
import Action from '../shared/action.js';
import YarlWebSocket from './ws.js';

class Simulation {
    phases;
    phase;
    time;
    timer;

    constructor () {
        this.phases = [
            new PhaseModel('phase.plan', 5000),
            new PhaseModel('phase.sim', 1000)
        ];
        this.phase_id = 0;
        this.phase = this.phases[this.phase_id];
        
        this.time = new TimeModel();
        this.time.left = this.phase.time;
        this.timer = setInterval(this.#on_update, this.time.dt);
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     */
    join = (ws) => {
        ws.simulation = this;

        console.log('join', ws.account);
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     */
    leave = (ws) => {
        ws.simulation = null;

        console.log('leave', ws.account);
    }

    /**
     * 
     * @param {YarlWebSocket} ws 
     * @param {Action} action 
     */
    command = (ws, action) => {
        const ts = Date.now();
        
        console.log('command', ws.account, action);

        if(this.phase.name === 'phase.sim') {
            const dt = ts - this.time.timestamp;
            if(dt > this.time.latency) {
                console.log('too late', dt);
                return;
            }
            
            console.log('just in time', dt);
            return;
        }

        console.log('in time');
    }

    #on_update = () => {
        this.time.left -= this.time.dt;

        if(this.time.left <= 0) {
            this.phase_id = (this.phase_id + 1) % this.phases.length;
            this.phase = this.phases[this.phase_id];
            
            this.time.left = this.phase.time;
            this.time.timestamp = Date.now();

        }

        console.log('#on_update', this.phase.name, this.time.left);
    }
}

export default Simulation;