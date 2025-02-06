import express from 'express';
import next from 'next';
import { NextParsedUrlQuery } from 'next/dist/server/request-meta'; // Import the correct type

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('/custom-route', (req, res) => {
      // Type assertion for req.query to ensure it's compatible with NextParsedUrlQuery
      const query = req.query as NextParsedUrlQuery;
      return app.render(req, res, '/index', query);
    });

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Error starting the server:', err);
    process.exit(1);
  });
