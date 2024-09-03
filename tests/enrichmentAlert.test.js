const request = require('supertest');
const dotenv = require('dotenv'); // Import dotenv to use it
const {getAuthToken} = require('../util/authHelper');
const enrichmentAlertPayload = require("../payloads/EnrichmentAlert.json");
const {
    deleteRuleById,
    deleteRecipientById,
    deleteEnrichmentAlertById,
    updateAlertStatus,
    deleteParentAlertById,
    testConnection,
    closePool
} = require('../util/dbHelper');

describe('Enrichment Alert Creation', () => {
    let authToken;
    let patBaseurl;
    let alertId;

    beforeAll(async () => { // Use async for beforeAll if async operations are present
        const env = process.env.ENV || 'sso';
        dotenv.config({path: `.env.${env}`});

        patBaseurl = process.env.PAT_BASEURL;
        authToken = await getAuthToken(); // Await the async function to get the token
    });

    it('should create an enrichment alert', async () => {
        const res = await request(patBaseurl)
            .post('/alerts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(enrichmentAlertPayload)
            .expect(201);

        const locationHeader = res.headers['location'];
        alertId = locationHeader.split('/').pop();
    });

    it('remove alert from the DB', async () => {
        if (alertId) {
            await testConnection();
            await updateAlertStatus(alertId);
            await deleteEnrichmentAlertById(alertId);
            await deleteRuleById(alertId);
            await deleteRecipientById(alertId);
            await deleteParentAlertById(alertId);
            await closePool();
        } else {
            throw new Error('Alert ID is not available.');
        }
    });
});
