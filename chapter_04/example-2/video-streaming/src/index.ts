import express from 'express';
import http from 'http';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.VIDEO_STORAGE_HOST) {
    throw new Error("Please specify the host name for the video storage microservice in variable VIDEO_STORAGE_HOST.")
}

if (!process.env.VIDEO_STORAGE_PORT) {
    throw new Error("Please specify the port number for the video storage microservice in variable VIDEO_STORAGE_PORT.")
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);

const app = express();

app.get('/video', (req, res) => {
    const forwardRequest = http.request(
        {
            host: VIDEO_STORAGE_HOST,
            port: VIDEO_STORAGE_PORT,
            path: '/video?path=SampleVideo_1280x720_1mb.mp4',
            method: 'GET',
            headers: req.headers,
        },
        forwardResponse => {
            res.writeHead(forwardResponse.statusCode!, forwardResponse.headers);
            forwardResponse.pipe(res);
        }
    );

    req.pipe(forwardRequest);
});

app.listen(PORT, () => {
    console.log('Microservice online');
});
