import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { getRandomColor, randomBiddingUpdated } from './lib/utils';
import 'dotenv/config';
import { getUserData } from './lib/requests';
import { BidController, BidStatus } from './types';
import { getCompletedBidsDB } from './lib/db';

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: '*',
  },
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('working!');
});

const users: Record<string, { username?: string; colour?: string }> = {};
let userIncrement = 0;
const setUserName = ({ id, customName = '' }: { id: string; customName?: string }) => {
  users[id] = { username: customName ? customName : `Guest ${userIncrement}`, colour: getRandomColor() };
  userIncrement++;
};

let BID: BidStatus = {
  amount: 0,
  timestamp: Date.now(),
  userData: null,
};

io.on('connection', async (socket: Socket) => {
  const userdata = await getUserData(socket);
  const canSendMessages = userdata === undefined;

  setUserName({ id: socket.id, ...(userdata && { customName: userdata.username }) });
  console.log(`${users[socket.id].username} connected`);
  console.log(socket.handshake.auth);

  socket.on('join', (room) => {
    socket.join(room);
    console.log('user joined room:', room);
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
    const durationInMilliseconds = duration * 1000;

    console.log(msg, duration);
    socket.broadcast.emit('startTimer', {
      startTime: Date.now(),
      duration,
      msg,
    });

    // const endTime = Date.now() + duration * 1000;
    // randomBiddingUpdated(socket, endTime);
    BID = {
      amount: 0,
      timestamp: Date.now(),
      userData: null,
    };

    console.log(`Starting ${duration}s timer with message: "${msg}"`);

    setTimeout(() => {
      console.log('timer FINSIHED!!!!!!!');
      socket.broadcast.emit('timerComplete', {
        msg: 'OMG ITS OVER',
        finalBidData: BID,
      });

      getCompletedBidsDB(process.env.MONGODB).then((collection) =>
        collection.insertOne({
          seller: 'Evan',
          buyerId: userdata._id,
          buyerName: userdata.displayName,
          title: msg,
          date: BID.timestamp,
          amount: BID.amount,
        })
      );
    }, durationInMilliseconds + 250);
  });

  socket.on('placeBid', ({ amount }) => {
    if (!userdata) {
      console.log('Unknown user tried to place bid!');
      return;
    }
    console.log(`GOT NEW BID FROM ${userdata.username}:`, amount);

    const currentBidder = {
      username: userdata.username,
      profilePic: `https://livebiddingprojectimages.blob.core.windows.net/images/${userdata.mail}` || '',
    };

    if (amount > BID.amount) {
      console.log('Bid is greater than previous bid');
      BID.amount = amount;
      BID.userData = { ...currentBidder };
      socket.emit('biddingUpdate', { ...currentBidder, bid: BID.amount });
      socket.broadcast.emit('biddingUpdate', { ...currentBidder, bid: BID.amount });
    }
  });
});

http.listen(3001, () => {
  console.log('listening on http://localhost:3001/');
});
