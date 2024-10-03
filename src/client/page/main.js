/* imports ********************************************************************/
import YarlWebSocket from '../ws.js';

/* app ************************************************************************/
/**
 * @type {YarlWebSocket}
 */
let ws = null;

function create_button (id, txt, handler) {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.id = id;
    btn.innerText = txt;
    btn.querySelector('#connect');
    btn.addEventListener('click', handler);
}

window.addEventListener(
    'load',
    e => {
        create_button('connect', 'CONNECT', () => {
            if(ws !== null) {
                throw new Error();
            }
        
            ws = new YarlWebSocket(
                `ws://127.0.0.1:11000`,
                []
            );
            window.ws = ws;
        });

        create_button('disconnect', 'DISCONNECT', () => {
            if(ws === null) {
                throw new Error();
            }
        
            ws.disconnect();
            ws = null;
            window.ws = null;
            
            console.clear();
        });

        create_button('command-ok', 'COMMAND', () => {
            if(ws === null) {
                throw new Error();
            }
        
            ws.send('cmd', {});
        });

        window.addEventListener(
            'yarl.action',
            e => {
                console.log(e);
            }
        )
    },
    { once: true }
)
