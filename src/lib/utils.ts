const RANDOM_COLOURS = [
  '#fc7a5e',
  '#fb9726',
  '#fbe126',
  '#a4fb26',
  '#26fb30',
  '#26fbde',
  '#26bafb',
  '#2646fb',
  '#7c42ff',
  '#e25fff',
  '#ff5fcc',
  '#f53d3d',
];

const RANDOM_USER_DATA = [
  {
    username: 'Sienna',
    profilePic:
      'https://www.shutterstock.com/image-photo/closeup-headshot-face-portrait-beautiful-260nw-2491646077.jpg',
  },
  {
    username: 'Elara',
    profilePic: 'https://www.shutterstock.com/image-photo/beautiful-gorgeous-50s-mid-aged-260nw-1918309769.jpg',
  },
  {
    username: 'John',
    profilePic: 'https://www.shutterstock.com/image-photo/confidence-face-smile-man-studio-260nw-2472683365.jpg',
  },
];

export const getRandomColor = () => {
  return RANDOM_COLOURS[Math.floor(Math.random() * RANDOM_COLOURS.length)];
};

export const randomBiddingUpdated = (socket, endTime) => {
  let previousBid = 1;
  let previousBidder = '';
  const randomDelay = Math.floor(Math.random() * 2000) + 4000;

  const intervalId = setInterval(() => {
    const timeLeft = endTime - Date.now();
    const people = RANDOM_USER_DATA.filter((user) => user.username !== previousBidder);
    const currentBidder = people[Math.floor(Math.random() * people.length)];
    const currentBid = previousBid + Math.floor(Math.random() * 50) + 1;

    previousBidder = currentBidder.username;
    previousBid = currentBid;

    if (timeLeft <= randomDelay) {
      clearInterval(intervalId);
    }
    socket.broadcast.emit('biddingUpdate', { ...currentBidder, bid: currentBid });
  }, randomDelay);
};
