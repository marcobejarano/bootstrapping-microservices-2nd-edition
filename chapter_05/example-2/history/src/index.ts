import express from 'express';
import mongodb from 'mongodb';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.")
}

if (!process.env.DBHOST) {
    throw new Error("Please specify the database host using environment variable DBHOST.");
}

if (!process.env.DBNAME) {
    throw new Error("Please specify the name of the database using environment variable DBNAME.");
}

const PORT = process.env.PORT;
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

const main = async () => {
    const app = express();

    app.use(express.json());

    const client = await mongodb.MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);
    const historyCollection = db.collection('history');

    app.post('/viewed', async (req, res) => {
        console.log("Received request to /viewed");
        const videoPath = req.body.videoPath;
        await historyCollection.insertOne({ videoPath: videoPath });

        console.log(`Added video ${ videoPath } to history.`);
        res.sendStatus(200);
    });

    app.get('/history', async (req, res) => {
        const skip = parseInt(req.query.skip as string);
        const limit = parseInt(req.query.limit as string);
        const history = await historyCollection.find()
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json({ history });
    });

    app.listen(PORT, () => {
        console.log('Microservice online');
    });
};

const startMicroservice = async () => {
    try {
        await main();
        console.log('Microservice started successfully');
    } catch (err: unknown) {
        console.error('Microservice failed to start');
        if (err instanceof Error) {
            console.error(err.stack || err.message);
        } else {
            console.error(err);
        }
    }
};

startMicroservice();
