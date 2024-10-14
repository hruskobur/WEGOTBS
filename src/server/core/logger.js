import Utils from 'util';

const LogJsonOptions = Object.freeze({
    depth: null,
    compact: true,
    showHidden: false
});

/**
 * @type {Function}
 */
let YarlLog = log_compact;

/**
 * 
 * @param {String} who 
 * @param {String} event 
 * @param {*} payload 
 */
function log_json (who, event, ...payload) {
    const timestamp = Date.now();
    payload = Utils.inspect(payload, LogOptions);

    const message = {
        timestamp,
        who,
        event,
        payload
    };

    console.log(message);
}

/**
 * 
 * @param {String} who 
 * @param {String} event 
 * @param {*} payload 
 */
function log_compact (who, event, ...payload) {
    console.log(
        `[${who}] ${event}`,
        payload
    );
}

/**
 * todo: DOESNT WORK
 * @param {'compact'|'json'} type default=compact
 */
function YarlLogInit (type='compact') {
    switch(type) {
        case 'json': {
            YarlLog = log_json
            break;
        }
        case 'compact': 
        default: {
            YarlLog = log_compact
            break;
        }
    }
}

export default YarlLog;

export {
    YarlLogInit
};