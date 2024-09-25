import { mock } from 'bun:test';

type ListenFnType = (port: number, callback?: () => void) => void;
type GetFnType = (path: string, handler: (req: any, res: any) => Promise<void> | void) => void;

export const mockListenFn = mock<ListenFnType>(() => {});
export const mockGetFn = mock<GetFnType>(() => {});

mock.module('express', () => {
    return {
        default: () => ({
            listen: mockListenFn,
            get: mockGetFn,
        }),
    };
});

type Video = {
    title: string;
    url: string;
};

export const mockVideosCollection = {
    find: (): { toArray: () => Promise<Video[]> } => ({
        toArray: async () => [
            { title: 'Mock Video 1', url: 'http://example.com/video1' },
            { title: 'Mock Video 2', url: 'http://example.com/video2' },
        ],
    }),
};

export const mockDb = {
    collection: () => mockVideosCollection,
};

export const mockMongoClient = {
    db: () => mockDb,
};

mock.module('mongodb', () => ({
    default: {
        MongoClient: {
            connect: async () => mockMongoClient,
        },
    },
}));
