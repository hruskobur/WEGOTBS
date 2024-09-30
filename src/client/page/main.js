/* imports ********************************************************************/
import YarlWebSocket from '../ws.js';

/* app ************************************************************************/
/**
 * @type {YarlWebSocket}
 */
let ws = null;

window.addEventListener(
    'load',
    e => {
        const btn_connect = document.createElement('button');
        document.body.appendChild(btn_connect);
        btn_connect.id = 'connect';
        btn_connect.innerText = 'CONNECT';
        btn_connect.querySelector('#connect');
        btn_connect.addEventListener(
            'click',
            e => {
                if(ws !== null) {
                    throw new Error();
                }
            
                ws = new YarlWebSocket(
                    `ws://127.0.0.1:11000`,
                    []
                );
            }
        );

        const btn_disconnect = document.createElement('button');
        document.body.appendChild(btn_disconnect);
        btn_disconnect.id = 'disconnect';
        btn_disconnect.innerText = 'DISCONNECT'
        btn_disconnect.querySelector('#disconnect');
        btn_disconnect.addEventListener(
            'click',
            e => {
                if(ws === null) {
                    throw new Error();
                }
            
                ws.disconnect();
                ws = null;
            }
        );

        const btn_command = document.createElement('button');
        document.body.appendChild(btn_command);
        btn_command.id = 'command';
        btn_command.innerText = 'COMMAND';
        btn_command.querySelector('#command');
        btn_command.addEventListener(
            'click',
            e => {
                if(ws === null) {
                    throw new Error();
                }
            
                ws.send('cmd', {});
            }
        );
    },
    {
        once: true
    }
)