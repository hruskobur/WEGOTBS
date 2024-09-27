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

        this.timestamp = undefined;
    }

    
    /**
     * @param {String} name 
     * @param {*} data 
     * @returns {ClientWebSocket}
     */
    send = (name, data) => {
        // check: do not send anything before the first update
        // avoiding this check will result in kick
        if(this.timestamp == null) {
            return;
        }

        const message = new ApplicationMessage()
        .time(this.timestamp)
        .add(name, data);

        console.log('client.command', message);

        // dev: to demonstrate latency
        // setTimeout(
        //     () => {
        //         super.send(
        //             Parser.serialize(
        //                 message
        //             )
        //         );
        //     },
        //     2500
        // );
        
        super.send(
            Parser.serialize(
                message
            )
        );

        return this;
    }

    /**
     * 
     */
    disconnect () {
        this.close();
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

        // step 2: update timestamp
        this.timestamp = data.timestamp;
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

window.command = function (name, data) {
    if(io === null) {
        throw new Error();
    }

    io.send(name, data);
}

window.addEventListener(
    'load',
    e => {
        document.querySelector('#connect')
        .addEventListener(
            'click',
            window.connect.bind(null, '127.0.0.1', 11000)
        );

        document.querySelector('#command')
        .addEventListener(
            'click',
            window.command.bind(null, 'cmd', {})
        );
    },
    {
        once: true
    }
)