import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { authMiddleware } from './middleware/auth';
import { NotificationService } from './services/notificationService';
import proprietariosRouter from './routes/proprietarios';
import imoveisRouter from './routes/imoveis';
import clientesRouter from './routes/clientes';
import contratosRouter from './routes/contratos';
import recibosRouter from './routes/recibos';
import despesasRouter from './routes/despesas';
import financeiroRouter from './routes/financeiro';
import dashboardRouter from './routes/dashboard';
import notificationsRouter from './routes/notifications';
import seedRouter from './routes/seed';
import seedCompletoRouter from './routes/seed_completo';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Cron Jobs (Agendamentos) ─────────────────────────────────────────

// Rodar verificação de vencimentos todo dia às 08:00 AM
cron.schedule('0 8 * * *', async () => {
  try {
    await NotificationService.checkContractExpirations();
  } catch (error) {
    console.error('❌ Erro no Cron Job de Vencimentos:', error);
  }
});

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
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/seed', seedRouter);
app.use('/api/seed-completo', seedCompletoRouter);

// ─── Protected route example ─────────────────────────────────────────
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});

// ─── Start Server ────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`SmartImob API rodando em http://localhost:${port}`);

  // Executa uma vez na inicialização para garantir que alertas do dia sejam processados
  NotificationService.checkContractExpirations().catch(console.error);
});

export default app;
