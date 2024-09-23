import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`First example listening on port ${ port }, point your browser at http://localhost:${ port }`);
});
