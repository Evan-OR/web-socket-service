import { User } from '.';

export type BidStart = {
  title: string;
  startingBid: number;
  durationInSeconds: number;
};

export type BidUpdate = {
  userData: User;
  newBid: number;
};
