// server.ts
import express from 'express';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('/custom-route', (req, res) => {
      // Render your specific component or page here
      return app.render(req, res, '/index', req.query);
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
