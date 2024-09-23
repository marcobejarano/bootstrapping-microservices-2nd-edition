import express from 'express';
import mongodb from 'mongodb';
import amqp from 'amqplib';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.")
}

if (!process.env.DBHOST) {
    throw new Error("Please specify the database host using environment variable DBHOST.");
}

if (!process.env.DBNAME) {
    throw new Error("Please specify the name of the database using environment variable DBNAME.");
}

if (!process.env.RABBITMQ) {
    throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBITMQ.");
}

const PORT = process.env.PORT;
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBITMQ = process.env.RABBITMQ;

const main = async () => {
    const app = express();

    app.use(express.json());

    const client = await mongodb.MongoClient.connect(DBHOST);
    const db = client.db(DBNAME);
    const historyCollection = db.collection('history');

    try {
        console.log(`Connecting to RabbitMQ server at ${ RABBITMQ }`);
        const messagingConnection = await amqp.connect(RABBITMQ);
        console.log('Connected to RabbitMQ');

        const messageChannel = await messagingConnection.createChannel();
        await messageChannel.assertExchange('viewed', 'fanout');

        const { queue } = await messageChannel.assertQueue('', { exclusive: true });
        console.log(`Creted queue ${ queue }, binding it to "viewed" exchange.`);

        await messageChannel.bindQueue(queue, 'viewed', '');

        await messageChannel.consume(queue, async (msg) => {
            if (msg && msg.content) {
                const parsedMsg = JSON.parse(msg.content.toString());
                console.log('Received a "viewed" message');

                await historyCollection.insertOne({ videoPath: parsedMsg.videoPath });
                console.log('Acknowledging message was handled.');

                messageChannel.ack(msg);
            } else {
                console.log('Message or content is null/undefined');
            }
        });

    } catch (err) {
        console.error('Failed to connect to RabbitMQ:', err);
    }

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
