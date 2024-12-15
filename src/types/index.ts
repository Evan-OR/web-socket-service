import { Socket } from 'socket.io';

export type BidController = Record<string, BidStatus>;

export type BidStatus = {
  amount: number;
  timestamp: number;
};

export interface UserSocket extends Socket {
  user?: User;
}

export type User = {
  _id?: string;
  username: string;
  registration_date: number;
  isSeller: boolean;
} & MSUserData;

export type MSUserData = {
  '@odata.context': string;
  businessPhones: string[];
  displayName: string;
  givenName: string;
  id: string;
  jobTitle: string | null;
  mail: string;
  mobilePhone: string | null;
  officeLocation: string | null;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
};
