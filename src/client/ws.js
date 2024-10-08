import Message from '../shared/message.js';

class YarlWebSocket extends WebSocket {
    static Events = Object.freeze({
        Action: 'app.action',
    })
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

        this.debug = false;
        this.send_delay = 0;
        this.recv_delay = 0;
    }
    
    /**
     * @public
     * @param {String} name 
     * @param {*} data 
     * @returns {YarlWebSocket}
     */
    send = (name, data) => {
        const message = new Message()
        .add(name, data);

        // note: development version - setTimeout will be removed
        setTimeout(
            () => {
                super.send(message.serialize());
            },
            this.send_delay
        );

        return this;
    }

    /**
     * @public
     */
    disconnect () {
        this.close();
    }

    /**
     * @private
     * @param {Event} event 
     */
    #on_open = (event) => {
        console.log('client.open', event);
    }

    /**
     * @private
     * @param {ErrorEvent} event 
     */
    #on_error = (event) => {
        console.error('client.error', event);
    }

    /**
     * @private
     * @param {CloseEvent} event 
     */
    #on_close = (event) => {
        console.log('client.close', event);
    }

    /**
     * @private
     * @param {MessageEvent} event 
     */
    #on_message = (event) => {
        // note: development version - setTimeout will be removed
        setTimeout(
            () => {
                const message = new Message().deserialize(event.data);

                while(message.length != 0) {
                    const action = message.shift();

                    switch(action.name) {
                        case 'ack': {
                            this.send(action.name, action.data);

                            continue;
                        }
                        case 'latency': {
                            this.send(action.name, action.data);

                            continue;
                        }
                    }
                    
                    window.dispatchEvent(
                        new CustomEvent('yarl.command', { detail: action })
                    );
                }
            },
            this.recv_delay
        );
    }

}

export default YarlWebSocket;