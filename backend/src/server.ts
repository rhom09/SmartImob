import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import proprietariosRouter from './routes/proprietarios';
import imoveisRouter from './routes/imoveis';
import clientesRouter from './routes/clientes';
import contratosRouter from './routes/contratos';
import recibosRouter from './routes/recibos';
import despesasRouter from './routes/despesas';
import financeiroRouter from './routes/financeiro';
import seedRouter from './routes/seed';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Health Check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/proprietarios', proprietariosRouter);
app.use('/api/imoveis', imoveisRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/contratos', contratosRouter);
app.use('/api/recibos', recibosRouter);
app.use('/api/despesas', despesasRouter);
app.use('/api/financeiro', financeiroRouter);
app.use('/api/seed', seedRouter);

// ─── Protected route example ─────────────────────────────────────────
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});

// ─── Start Server ────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`SmartImob API rodando em http://localhost:${port}`);
});

export default app;
