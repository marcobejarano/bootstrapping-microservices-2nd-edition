import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

app.get('/video', async (req, res) => {
    const videoPath = path.join(import.meta.dir, '../../videos/SampleVideo_1280x720_1mb.mp4');

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

app.listen(port, () => {
    console.log(`Second example listening on port ${ port }, point your browser at http://localhost:${ port }`);
});
