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
     * @param {*} data 
     */
    constructor (name, data) {
        this.name = name;
        this.data = data;
    }
}

export default Action;