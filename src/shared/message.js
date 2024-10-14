import Action from './action.js';

/**
 * The unified server & client message container.
 */
class YarlMessage {
    /**
     * @type {Array<Action>}
     */
    actions;

    constructor () {
        this.actions = [];
    }

    get length () {
        return this.actions.length
    }

    /**
     * 
     * @param {String|Number} name 
     * @param {*} data 
     * @returns {YarlMessage} this
     */
    create (name, data) {
        this.actions.push(
            {name, data}
        );

        return this;
    }

    /**
     * @public
     * @param {Action} action 
     * @returns {YarlMessage} this
     */
    push (action) {
        this.actions.push(action);

        return this;
    }

    /**
     * Removes the first payload from the internal array and returns it.
     * @returns {Action}
     */
    shift () {
        return this.actions.shift();
    }

    /**
     * @returns {YarlMessage} this
     */
    clear () {
        this.actions = [];

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
     * @returns {YarlMessage} this
     */
    deserialize = (data) => {
        Object.assign(
            this,
            JSON.parse(data)
        );

        return this;
    }
}

export default YarlMessage;