const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    console.log('Клієнт підключений.');

    ws.on('message', function incoming(message) {
        console.log('Отримано повідомлення від клієнта:', message);

        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', function close() {
        console.log('Клієнт відключений.');
    });
});

