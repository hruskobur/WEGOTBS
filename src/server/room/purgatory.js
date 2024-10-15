import YarlClient from '../server/clients/client.js';

const TheDumbKickReason = 'you have been kicked out of the purgatory...';

const YarlRoomPurgatory = Object.freeze({
    /**
     * 
     * @param {YarlClient} client 
     */
    command (client) {
        client.kick(TheDumbKickReason);
    }
});

export default YarlRoomPurgatory;