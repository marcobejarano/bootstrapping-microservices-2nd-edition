import express from 'express';
import http from 'http';
import mongodb from 'mongodb';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.VIDEO_STORAGE_HOST) {
    throw new Error("Please specify the host name for the video storage microservice in variable VIDEO_STORAGE_HOST.")
}

if (!process.env.VIDEO_STORAGE_PORT) {
    throw new Error("Please specify the port number for the video storage microservice in variable VIDEO_STORAGE_PORT.")
}

if (!process.env.DBHOST) {
    throw new Error("Please specify the databse host using environment variable DBHOST.");
}

if (!process.env.DBNAME) {
    throw new Error("Please specify the name of the database using environment variable DBNAME.");
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

const main = async () => {
    const client = await mongodb.MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);
    const videosCollection = db.collection("videos");

    const app = express();

    app.get('/video', async (req, res) => {
        try {
            const videoId = req.query.id as string;

            if (!mongodb.ObjectId.isValid(videoId)) {
                res.status(400).send('Invalid video ID');
                return;
            }

            const objectId = new mongodb.ObjectId(videoId);
            const videoRecord = await videosCollection.findOne({ _id: objectId });
            
            if (!videoRecord) {
                res.sendStatus(404);
                return;
            }

            const forwardRequest = http.request(
                {
                    host: VIDEO_STORAGE_HOST,
                    port: VIDEO_STORAGE_PORT,
                    path: `/video?path=${ videoRecord.videoPath }`,
                    method: 'GET',
                    headers: req.headers,
                },
                forwardResponse => {
                    res.writeHead(forwardResponse.statusCode!, forwardResponse.headers);
                    forwardResponse.pipe(res);
                }
            );

            req.pipe(forwardRequest);
        } catch (err) {
            res.status(500).send('Error retrieving video')
        }
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
