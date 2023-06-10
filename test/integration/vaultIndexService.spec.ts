import request from 'supertest';
import { app } from '../../src/app'; // Import your Express application

describe('WHEN VaultIndexService is called', () => {
  it('should return a successful response', (done) => {
    request(app) // Make a request to your desired route
      .get('/ping')
      .expect(200) // Assert the expected status code
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).toMatchSnapshot()
        // Add more assertions as needed
        done();
      });
  });
});
