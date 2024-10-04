/* imports ********************************************************************/
import Message from '../../shared/message.js';
import YarlWebSocket from '../ws.js';

/* app ************************************************************************/
/**
 * @type {YarlWebSocket}
 */
let ws = null;

function on_connect () {
    if(ws !== null) {
        throw new Error();
    }

    console.clear();

    ws = new YarlWebSocket(
        `ws://127.0.0.1:11000`,
        []
    );

    window.addEventListener('yarl.command', on_command);

    console.log('connect');
}

function on_disconnect () {
    if(ws === null) {
        throw new Error();
    }

    console.log('disconnect');

    window.removeEventListener('yarl.command', on_command);
    ws.close();
    ws = null;
}

function on_send () {
    if(ws === null) {
        throw new Error();
    }

    const name = document.querySelector('#debug-send-name').value;
    const data = JSON.parse(
        document.querySelector('#debug-send-data').value
    );

    console.log('send', name, data);

    ws.send(name, data);
}

function on_command (e) {
    console.log('command', e.detail);
}

function on_send_delay_input (e) {
    ws.send_delay = e.target.value;
    
    console.log('send_delay', ws.send_delay);
}

function on_recv_delay_input (e) {
    ws.recv_delay = e.target.value;
    
    console.log('recv_delay', ws.recv_delay);
}

function on_toggle_debug () {
    if(ws === null) {
        throw new Error();
    }

    const checked = document.querySelector('#debug-toggle').checked;
    const send_delay = document.querySelector('#debug-send-delay');
    const recv_delay = document.querySelector('#debug-recv-delay');
    
    ws.debug = checked;

    if(checked === true) {
        send_delay.addEventListener('input', on_send_delay_input);
        recv_delay.addEventListener('input', on_recv_delay_input);

        ws.send_delay = Number(send_delay.value);
        ws.recv_delay = Number(recv_delay.value);
    } else {
        send_delay.removeEventListener('input', on_send_delay_input);
        recv_delay.removeEventListener('input', on_recv_delay_input);

        ws.send_delay = 0;
        ws.recv_delay = 0;
    }

    console.log('toggle_debug', checked);
}

window.addEventListener(
    'load',
    e => {
       document
       .querySelector('#debug-connect')
       .addEventListener('click', on_connect);

       document
       .querySelector('#debug-disconnect')
       .addEventListener('click', on_disconnect);

       document
       .querySelector('#debug-toggle')
       .addEventListener('change', on_toggle_debug);

       document
       .querySelector('#debug-send')
       .addEventListener('click', on_send);
    },
    { once: true }
)
