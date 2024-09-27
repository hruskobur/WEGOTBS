import ApplicationMessage from './message.js';

/**
 * 
 * @param {ApplicationMessage} data 
 * @returns {String}
 */
function serialize (data) {
    return JSON.stringify(
        data
    );
}

/**
 * @param {String} data 
 * @returns {ApplicationMessage}
 */
function deserialize (data) {
    return Object.assign(
        new ApplicationMessage(),
        JSON.parse(
            data
        )
    );
}

export {
    serialize, deserialize
};