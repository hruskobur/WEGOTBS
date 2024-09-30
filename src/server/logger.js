import Utils from 'util';

const LogOptions = Object.freeze({
    depth: null,
    compact: true
});

/**
 * 
 * @param {String} caller 
 * @param {String} event 
 * @param {...any} payload 
 */
function log (caller, event, ...payload) {
    const timestamp = Date.now();
    payload = Utils.inspect(payload, LogOptions);

    const message = {
        timestamp,
        caller,
        event,
        payload
    };

    console.log(message);
}

export default log;