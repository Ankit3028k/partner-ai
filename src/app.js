const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const authRoutes          = require('./api/routes/auth.routes');
const conversationRoutes  = require('./api/routes/conversation.routes');
const usageRoutes         = require('./api/routes/usage.routes');
const {errorHandler}      = require('./api/middlewares/error.middleware');
const {notFound}          = require('./api/middlewares/notFound.middleware');

const app = express();

// ── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max:      Number(process.env.RATE_LIMIT_MAX)        || 60,
  message:  {success:false, message:'Too many requests. Try again shortly.'},
});
app.use('/api', limiter);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({status:'ok', version:'1.0.0', timestamp: new Date().toISOString()})
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/usage',         usageRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
