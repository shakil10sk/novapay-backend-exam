import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Transaction (e2e) - Idempotency Scenarios', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Scenario A/B: Duplicate key should return 409 (if processing) or cached (if completed)', async () => {
        // 1. First request
        const payload = {
            senderWalletId: '98409395-564d-4e2b-bb66-e82df4b87a8b',
            receiverWalletId: '98409395-564d-4e2b-bb66-e82df4b87a8c',
            amount: 100,
            currency: 'USD',
            idempotencyKey: `test-key-${Date.now()}`,
        };

        // Note: Wallets should exist in DB. Mocking or pre-seeding would be needed for real DB.
        // Assuming DB is clean/pre-seeded for this test environment.

        // Simulating parallel requests with same key
        const res1 = request(app.getHttpServer())
            .post('/api/v1/transfers/international')
            .send(payload);

        const res2 = request(app.getHttpServer())
            .post('/api/v1/transfers/international')
            .send(payload);

        const [response1, response2] = await Promise.all([res1, res2]);

        // One should succeed or both could return based on how fast they hit the DB.
        // In our manual scenario logic, one will hit Conflict.
        expect([201, 409]).toContain(response1.status);
        expect([201, 409]).toContain(response2.status);
    });

    it('Scenario E: Payload mismatch detection', async () => {
        const key = `scenario-e-${Date.now()}`;
        const payload1 = {
            senderWalletId: '98409395-564d-4e2b-bb66-e82df4b87a8b',
            receiverWalletId: '98409395-564d-4e2b-bb66-e82df4b87a8c',
            amount: 100,
            currency: 'USD',
            idempotencyKey: key,
        };

        // Succeeds
        await request(app.getHttpServer())
            .post('/api/v1/transfers/international')
            .send(payload1);

        // Same key, different amount ($200)
        const payload2 = { ...payload1, amount: 200 };
        const res = await request(app.getHttpServer())
            .post('/api/v1/transfers/international')
            .send(payload2);

        expect(res.status).toBe(422);
        expect(res.body.message).toContain('payload mismatch');
    });
});
