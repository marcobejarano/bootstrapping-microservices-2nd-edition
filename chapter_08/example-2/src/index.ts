import express from 'express';
import path from 'path';
import fs from 'fs';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

const PORT = process.env.PORT;

const app = express();

app.get('/live', (req, res) => {
    res.sendStatus(200);
});

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
    } catch (err) {
        const error = err as NodeJS.ErrnoException;

        if (error.code === 'ENOENT') {
            res.status(404).send('Video file not found');
        } else {
            res.status(500).send('Internal server error');
        }
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log('Microservice online');
    });
}

export { app };
