import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { startMicroservice } from "../../src";
import mongodb, { Db } from "mongodb";

describe('Metadata microservice', () => {
    const DBHOST = 'mongodb://localhost:27017';
    const DBNAME = 'testdb';
    const PORT = 3000;
    const BASE_URL = `http://localhost:${ PORT }`;

    let microservice: { close: any; db?: Db; };

    beforeAll(async () => {
        microservice = await startMicroservice(DBHOST, DBNAME, PORT);
    });

    afterAll(async () => {
        await microservice.close();
    });

    const httpGet = async (route: string) => {
        const url = `${ BASE_URL }/${ route }`;
        console.log(`Requesting ${ url }`);
        return await fetch(url);
    };

    type VideoRecord = {
        _id: mongodb.BSON.ObjectId,
        videoPath: string,
    };

    const loadDatabaseFixture = async (collectionName: string, records: VideoRecord[]) => {
        await microservice.db?.dropDatabase();

        const collection = microservice.db?.collection(collectionName);
        await collection?.insertMany(records);
    }

    it('/videos route retrieves data via videos collection',async () => {
        const id1 = new mongodb.ObjectId();
        const id2 = new mongodb.ObjectId();
        const videoPath1 = 'my-video-1.mp4';
        const videoPath2 = 'my-video-2.mp4';

        const testVideos = [
            {
                _id: id1,
                videoPath: videoPath1,
            },
            {
                _id: id2,
                videoPath: videoPath2,
            },
        ];

        await loadDatabaseFixture('videos', testVideos);

        const response = await httpGet('/videos');
        expect(response.status).toEqual(200);

        const data = await response.json();
        const videos = data.videos;
        expect(videos.length).toEqual(2);
        expect(videos[0]._id).toEqual(id1.toString());
        expect(videos[0].videoPath).toEqual(videoPath1);
        expect(videos[1]._id).toEqual(id2.toString());
        expect(videos[1].videoPath).toEqual(videoPath2);
    });
});