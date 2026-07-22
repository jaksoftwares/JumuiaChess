import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';

// Import route modules
import tournamentsRouter from './routes/tournaments.routes';
import registrationsRouter from './routes/registrations.routes';
import mpesaRouter from './routes/mpesa.routes';
import shopRouter from './routes/shop.routes';
import blogRouter from './routes/blog.routes';
import galleryRouter from './routes/gallery.routes';
import partnersRouter from './routes/partners.routes';
import settingsRouter from './routes/settings.routes';
import contactRouter from './routes/contact.routes';

dotenv.config();

const app = express();

// Configure CORS
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Mount Routes at /api
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/mpesa', mpesaRouter);
app.use('/api/shop', shopRouter);
app.use('/api/blog', blogRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/contact', contactRouter);

// Centralized error handler mounted last
app.use(errorHandler);

export default app;
