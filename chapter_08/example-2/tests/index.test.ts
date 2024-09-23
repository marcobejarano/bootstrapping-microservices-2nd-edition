import { describe, it, expect } from 'bun:test';
import request from 'supertest';
import { app } from '../src';

describe('Video streaming microservice', () => {
  it('Microservice can handle requests', async () => {
    const response = await request(app).get('/live');
    expect(response.status).toBe(200);
  });
});
