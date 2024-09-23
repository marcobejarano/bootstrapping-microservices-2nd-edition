import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

const PORT = process.env.PORT;

const sendViewedMessage = (videoPath: string) => {
    const postOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const requestBody = {
        videoPath: videoPath,
    };

    const req = http.request(
        'http://history/viewed',
        postOptions,
    );

    req.on('close', () => {
        console.log("Sent 'viewed' message to history microservice.");
    });

    req.on('error', (err) => {
        console.error("Failed to send 'viewed' message!");
        console.error(err && err.stack || err);
    });

    req.write(JSON.stringify(requestBody));
    req.end();
}

const main = async () => {
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
            sendViewedMessage(videoPath);
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
