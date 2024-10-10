/**
 * @typedef {Object} MessagePayload
 * @property {String|Number} name
 * @property {*} data
 */

/**
 * The unified server & client message container.
 */
class Message {
    /**
     * @type {Array<MessagePayload>}
     */
    payload;

    constructor () {
        this.payload = [];
    }

    get length () {
        return this.payload.length
    }

    /**
     * 
     * @param {String|Number} name 
     * @param {*} data 
     * @returns {Message} this
     */
    add (name, data) {
        this.payload.push(
            {name, data}
        );

        return this;
    }

    /**
     * Removes the first payload from the internal array and returns it.
     * @returns {MessagePayload}
     */
    shift () {
        return this.payload.shift();
    }

    /**
     * @returns {Message} this
     */
    clear () {
        this.payload = [];

        return this;
    }
    
    /**
     * @returns {String}
     */
    serialize = () => {
        return JSON.stringify(this);
    }

    /**
     * @param {String} data
     * @returns {Message} this
     */
    deserialize = (data) => {
        Object.assign(
            this,
            JSON.parse(data)
        );

        return this;
    }
}

export default Message;