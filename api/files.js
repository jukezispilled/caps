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
      // Save new file names
      const { files } = req.body; // Expecting { files: [{ name, timestamp }, ...] }
      if (!files || !Array.isArray(files)) {
        res.status(400).json({ error: 'Files data is required and should be an array' });
        return;
      }

      // Add a timestamp for each file
      const newFiles = files.map(file => ({
        ...file,
        timestamp: new Date().toISOString(),
      }));

      await collection.insertMany(newFiles); // Use insertMany to insert multiple files
      res.status(201).json(newFiles);
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