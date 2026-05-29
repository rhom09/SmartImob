import prisma from '../lib/prisma';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { EmailService } from './emailService';

export class NotificationService {
  /**
   * Processa alertas de vencimento de contratos
   * Busca contratos que vencem exatamente em 30 dias
   */
  static async checkContractExpirations() {
    console.log('🔍 Iniciando verificação de vencimentos de contratos...');

    const targetDate = addDays(new Date(), 30);
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    const contracts = await prisma.contract.findMany({
      where: {
        status: 'ATIVO',
        dataFim: {
          gte: start,
          lte: end,
        },
      },
      include: {
        inquilino: true,
        imovel: true,
      },
    });

    console.log(`📑 Encontrados ${contracts.length} contratos vencendo em ${targetDate.toLocaleDateString()}`);

    for (const contract of contracts) {
      await this.createExpiryAlert(contract);
    }
  }

  /**
   * Cria um alerta no banco e envia e-mail se permitido
   */
  private static async createExpiryAlert(contract: any) {
    const alertMessage = `O contrato #${contract.numeroContrato} (${contract.inquilino.nome}) vence em 30 dias.`;

    // 1. Verifica se já existe um alerta de vencimento recente para este contrato
    // para evitar duplicidade caso o script rode múltiplas vezes
    const existingAlert = await prisma.alert.findFirst({
      where: {
        contratoId: contract.id,
        tipo: 'VENCIMENTO',
        status: 'ATIVO',
      }
    });

    if (existingAlert) {
      console.log(`⚠️ Alerta já existe para o contrato ${contract.numeroContrato}. Pulando...`);
      return;
    }

    // 2. Registra o alerta no banco de dados
    const alert = await prisma.alert.create({
      data: {
        contratoId: contract.id,
        tipo: 'VENCIMENTO',
        mensagem: alertMessage,
        dataEvento: contract.dataFim,
        status: 'ATIVO',
      }
    });

    console.log(`✅ Alerta registrado no banco: ID ${alert.id}`);

    // 3. Busca usuários administradores/gestores para notificar via e-mail
    // e verifica suas preferências
    const usersToNotify = await prisma.user.findMany({
      where: {
        status: 'ATIVO',
        perfil: { in: ['ADMIN', 'MANAGER'] },
      },
      include: {
        notificationPreferences: {
          where: { tipoAlerta: 'VENCIMENTO' }
        }
      }
    });

    for (const user of usersToNotify) {
      const preference = user.notificationPreferences[0];

      // Se não houver preferência definida, assume 'true' por padrão (comportamento do model)
      const isEmailEnabled = preference ? preference.emailEnabled : true;

      if (isEmailEnabled) {
        try {
          const html = EmailService.generateContractExpiryTemplate({
            inquilino: contract.inquilino.nome,
            imovel: contract.imovel.endereco,
            dataVencimento: contract.dataFim.toLocaleDateString('pt-BR'),
            linkContrato: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contratos/${contract.id}`
          });

          await EmailService.sendEmail(
            user.email,
            `Alerta de Vencimento: Contrato #${contract.numeroContrato}`,
            html
          );
          console.log(`📧 E-mail enviado para ${user.email}`);
        } catch (error) {
          console.error(`❌ Erro ao enviar e-mail para ${user.email}:`, error);
        }
      }
    }
  }
}
