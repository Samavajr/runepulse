import Fastify from 'fastify';
import cors from '@fastify/cors';
import ingestRoutes from './routes/ingest.js';
import analyticsRoutes from './routes/analytics.js';
import goalsRoutes from './routes/goals.js';
import pairRoutes from './routes/pair.js';

const app = Fastify({ logger: true });

app.register(cors, {
  origin: true
});

app.register(ingestRoutes, { prefix: '/ingest' });
app.register(analyticsRoutes);
app.register(goalsRoutes);
app.register(pairRoutes);

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' });
