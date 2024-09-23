import express from 'express';

if (!process.env.PORT) {
    throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.")
}

const PORT = process.env.PORT;

const main = async () => {
    console.log('Hello world!');

    const app = express();

    // Add route handlers here.

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
