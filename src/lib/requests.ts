import { User } from '@/types';
import { Socket } from 'socket.io';

export const getUserData = async (s: Socket) => {
  try {
    const authToken = s.handshake.headers['x-auth-token'];
    const userData = JSON.parse(s.handshake.headers['x-user-data'] as string) as User;

    const restURL = process.env['REST_SERVICE_URL'];

    const req = await fetch(`${restURL}/user`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return userData;
  } catch (e) {
    return undefined;
  }
};
