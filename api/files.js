import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Add this to your Vercel environment variables
const dbName = 'timeCapsuleDB'; // Replace with your database name
const collectionName = 'files'; // Replace with your collection name

const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (req.method === 'GET') {
      // Get all file names
      const files = await collection.find({}).toArray();
      res.status(200).json(files);
    } else if (req.method === 'POST') {
      // Save a new file name
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'File name is required' });
        return;
      }

      const newFile = {
        name,
        timestamp: new Date().toISOString(),
      };

      await collection.insertOne(newFile);
      res.status(201).json(newFile);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling /files:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}