import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import { getRandomColor, randomBiddingUpdated } from './utils/utils';

const app = express();
const http = createServer(app);
const io = new Server(http, {
    cors: {
        origin: '*',
    },
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users: Record<string, { username?: string; colour?: string }> = {};
let userIncrement = 0;
const setUserName = ({ id, customName = '' }: { id: string; customName?: string }) => {
    users[id] = { username: customName ? customName : `Guest ${userIncrement}`, colour: getRandomColor() };
    userIncrement++;
};

io.on('connection', (socket) => {
    setUserName({ id: socket.id });
    console.log(`${users[socket.id].username} connected`);
    console.log(socket.handshake.auth);

    socket.on('join', (room) => {
        socket.join(room);
        console.log('user joined room:', room);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        const formattedMessage = `${users[socket.id].username} left`;
        socket.broadcast.emit('message', { timestamp: Date.now(), msg: formattedMessage, type: 'host' });
    });

    socket.on('message', (msg) => {
        socket.broadcast.emit('message', {
            timestamp: Date.now(),
            username: users[socket.id].username,
            colour: users[socket.id].colour,
            msg,
            type: 'user',
        });

        const formattedMessage = `${users[socket.id].username}: ${msg}`;
        console.log(formattedMessage);
    });

    socket.on('startTimer', ({ msg, duration }) => {
        socket.broadcast.emit('startTimer', {
            startTime: Date.now(),
            duration,
            msg,
        });

        const endTime = Date.now() + duration * 1000;
        randomBiddingUpdated(socket, endTime);

        console.log(`Starting ${duration}s timer with message: "${msg}"`);
    });
});

http.listen(3001, () => {
    console.log('listening on http://localhost:3001/');
});
