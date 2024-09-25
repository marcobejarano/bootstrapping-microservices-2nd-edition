import { describe, it, expect, mock } from "bun:test";
import { startMicroservice } from ".";
import { mockGetFn, mockListenFn, mockVideosCollection } from "../mocks/mocks";

describe('Metadata microservice', () => {
    it('microservice starts web server on startup', async () => {
        await startMicroservice('dbhost', 'dbname', 3000);

        expect(mockListenFn).toHaveBeenCalledTimes(1);
        expect(mockListenFn).toHaveBeenCalledWith(3000, expect.any(Function));
    });

    it('/videos route is handled', async () => {
        await startMicroservice('dbhost', 'dbname', 3000);
        
        expect(mockGetFn).toHaveBeenCalled();

        const videosRoute = mockGetFn.mock.calls[0][0];
        expect(videosRoute).toEqual("/videos");
    });

    it('/videos route retreives data via videos collection', async () => {
        await startMicroservice('dbhost', 'dbname', 3000);

        const mockRequest = {};
        const mockJsonFn = mock(() => {});
        const mockResponse = {
            json: mockJsonFn,
        };

        const mockRecord1 = { title: 'Video 1', url: 'http://example.com/video1' };
        const mockRecord2 = { title: 'Video 2', url: 'http://example.com/video2' };

        mockVideosCollection.find = () => ({
            toArray: async () => [mockRecord1, mockRecord2],
        });

        const videosRouteHandler = mockGetFn.mock.calls[0][1];
        await videosRouteHandler(mockRequest, mockResponse);

        expect(mockJsonFn).toHaveBeenCalledTimes(1);
        expect(mockJsonFn).toHaveBeenCalledWith({
            videos: [mockRecord1, mockRecord2],
        });
    });
});
