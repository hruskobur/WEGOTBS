import YarlClient from '../../server/client.js';

const PurgatoryRoom = {
    /**
     * 
     * @param {YarlClient} client 
     */
    send: function (client) {
        client.kick('you have been kicked out of the purgatory...');
    }
};

export default PurgatoryRoom;