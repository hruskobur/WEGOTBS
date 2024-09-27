/* imports ********************************************************************/
import ApplicationCommand from '../shared/command.js';
import ApplicationMessage from '../shared/message.js';
import * as Parser from '../shared/parser.js';

/* core ***********************************************************************/
class ClientWebSocket extends WebSocket {
    /**
     * 
     * @param {String|URL} url 
     * @param {Array<String>|String} protocols 
     */
    constructor (url, protocols) {
        super(url, protocols);

        this.binaryType = 'arraybuffer';

        this.onopen = this.#on_open;
        this.onclose = this.#on_close;
        this.onerror = this.#on_error;
        this.onmessage = this.#on_message;
    }

    /**
     * 
     */
    disconnect () {
        this.close();
    }

    /**
     * 
     * @param {*} msg 
     */
    send (msg) {
        msg = Parser.serialize(msg);

        console.log('client.send', msg);

        super.send(msg);
    }

    /**
     * @private
     * @param {Event} event 
     */
    #on_open = (event) => {
        console.log('open', event);
    }

    /**
     * @private
     * @param {ErrorEvent} event 
     */
    #on_error = (event) => {
        console.error('error', event);
    }

    /**
     * @private
     * @param {CloseEvent} event 
     */
    #on_close = (event) => {
        console.log('close', event);
    }

    /**
     * @private
     * @param {MessageEvent} event 
     */
    #on_message = (event) => {
        // step 1: receive & parse data
        const data = Parser.deserialize(
            event.data
        );

        console.log('client.recv', data);
    }
}

/* app ************************************************************************/
let io = null;

window.connect = function (url, port) {
    if(io !== null) {
        throw new Error();
    }

    io = new ClientWebSocket(
        `ws://${url}:${port}`,
        []
    );
}

window.disconnect = function () {
    if(io === null) {
        throw new Error();
    }

    io.disconnect();
    io = null;
}

window.send = function (cmd) {
    if(io === null) {
        throw new Error();
    }

    io.send(cmd);
}