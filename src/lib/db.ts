import { MongoClient } from 'mongodb';

const getCompletedBidsDB = async (connectionString: string) => {
  const client = new MongoClient(connectionString);
  await client.connect();
  return client.db('live_streaming_db').collection('completed_bids');
};

export { getCompletedBidsDB };
