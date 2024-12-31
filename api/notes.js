import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Add this to your Vercel environment variables
const dbName = 'timeCapsuleDB'; // Replace with your database name
const collectionName = 'notes'; // Replace with your collection name

const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (req.method === 'GET') {
      // Get the latest note
      const note = await collection.findOne({});
      res.status(200).json(note || {});
    } else if (req.method === 'POST') {
      // Save or update the note
      const { note } = req.body;
      if (!note) {
        res.status(400).json({ error: 'Note content is required' });
        return;
      }

      await collection.updateOne(
        {},
        { $set: { note, timestamp: new Date().toISOString() } },
        { upsert: true }
      );

      res.status(201).json({ message: 'Note saved successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling /notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}