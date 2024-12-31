import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('timeCapsuleDB'); // Use your actual DB name
const collection = db.collection('files'); // Use your actual collection name

export default async function handler(req, res) {
  try {
    // Ensure the client is connected
    if (!client.isConnected()) {
      await client.connect();
    }

    if (req.method === 'GET') {
      // Get all file names
      const files = await collection.find({}).toArray();
      return res.status(200).json(files);
    }

    if (req.method === 'POST') {
      // Save a new file name
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'File name is required' });
      }

      const newFile = {
        name,
        timestamp: new Date().toISOString(),
      };

      const result = await collection.insertOne(newFile);
      return res.status(201).json(newFile);
    }

    // Handle unsupported HTTP methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error handling /files:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}