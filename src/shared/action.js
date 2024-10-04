/**
 * 
 */
class Action {
    /**
     * @type {String|Number}
     */
    name;

    /**
     * @type {*}
     */
    data;

    /**
     * 
     * @param {String|Number} name 
     * @param {*} data [default=undefined]
     */
    constructor (name, data=undefined) {
        this.name = name;
        this.data = data
    }
}

export default Action;