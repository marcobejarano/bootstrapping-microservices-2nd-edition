import express from 'express';
import path from 'path';
import fs from 'fs';
import amqp from 'amqplib';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.RABBITMQ) {
    throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT.");
}

const PORT = process.env.PORT;
const RABBITMQ = process.env.RABBITMQ;

const main = async () => {
    console.log(`Connecting to RabbitMQ server at ${ RABBITMQ }`);
    const messagingConnection = await amqp.connect(RABBITMQ);
    console.log('Connected to RabbitMQ.');
    
    const messageChannel = await messagingConnection.createChannel();
    await messageChannel.assertExchange('viewed', 'fanout');

    const broadCastViewedMessage = (messageChannel: amqp.Channel, videoPath: string) => {
        console.log(`Publishing message on "viewed" exchange.`);

        const msg = { videoPath: videoPath };
        const jsonMsg = JSON.stringify(msg);
        messageChannel.publish("viewed", "", Buffer.from(jsonMsg));
    }

    const app = express();

    app.get('/video', async (req, res) => {
        const isProduction = process.env.NODE_ENV === 'production';
        const videoPath = path.join(import.meta.dir,
            isProduction ?
            './videos/SampleVideo_1280x720_1mb.mp4' :
            '../videos/SampleVideo_1280x720_1mb.mp4'
        );

        try {
            const stats = await fs.promises.stat(videoPath);
            
            res.writeHead(200, {
                "Content-Length": stats.size,
                "Content-Type": 'video/mp4',
            });
            
            fs.createReadStream(videoPath).pipe(res);
            broadCastViewedMessage(messageChannel, videoPath);
        } catch (err) {
            const error = err as NodeJS.ErrnoException;

            if (error.code === 'ENOENT') {
                res.status(404).send('Video file not found');
            } else {
                res.status(500).send('Internal server error');
            }
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
