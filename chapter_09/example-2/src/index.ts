import express from 'express';
import mongodb from 'mongodb';

const startMicroservice = async (dbhost: string, dbname: string, port: number) => {
    try {
        const client = await mongodb.MongoClient.connect(dbhost);
        const db = client.db(dbname);
        const videosCollection = db.collection('videos');

        const app = express();

        app.get('/videos', async (req, res) => {
            const videos = await videosCollection.find().toArray();
            res.json({ videos: videos });
        });

        const server = app.listen(port, () => {
            console.log('Microservice online');
        });

        return {
            close: () => {
                server.close();
                client.close();
            },
            db: db,
        };
    } catch (err) {
        throw err;
    }   
};

const main = async () => {
    const { DBHOST, DBNAME, PORT } = process.env;

    if (!DBHOST) {
        throw new Error("Please specify the databse host using environment variable DBHOST.");
    }

    if (!DBNAME) {
        throw new Error("Please specify the databse name using environment variable DBNAME.");
    }

    if (!PORT) {
        throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
    }

    const parsedPort = parseInt(PORT, 10);
    if (isNaN(parsedPort)) {
        throw new Error("PORT environment variable must be a valid number.");
    }

    await startMicroservice(DBHOST, DBNAME, parsedPort);
}

const runMicroservice = async () => {
    try {
        await main();
    } catch (err) {
        console.error('Microservice failed to start');
        console.error(err instanceof Error ? err.stack : err);
    }
};

if (require.main === module) {
    runMicroservice();
}

export { startMicroservice };
