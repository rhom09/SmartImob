import prisma from '../lib/prisma';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { EmailService } from './emailService';

export class NotificationService {
  /**
   * Processa alertas de vencimento de contratos
   * Busca contratos que vencem exatamente em 30 dias
   */
  static async checkContractExpirations(imobiliariaId?: string) {
    console.log(`🔍 Iniciando verificação de vencimentos de contratos${imobiliariaId ? ` para Imobiliária ${imobiliariaId}` : ' (Global)'}...`);

    const targetDate = addDays(new Date(), 30);
    // Janela de busca mais ampla para lidar com fuso horário: do início do dia anterior ao fim do dia posterior
    const start = startOfDay(addDays(targetDate, -1));
    const end = endOfDay(addDays(targetDate, 1));

    console.log(`📅 Janela de busca (UTC/Server): ${start.toISOString()} até ${end.toISOString()}`);

    const where: any = {
      status: 'ATIVO',
      dataFim: {
        gte: start,
        lte: end,
      },
    };
    if (imobiliariaId) where.imobiliariaId = imobiliariaId;

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        inquilino: true,
        imovel: true,
      },
    });

    console.log(`📑 Contratos na janela: ${contracts.length}`);
    contracts.forEach(c => console.log(`  - #${c.numeroContrato} (${c.inquilino.nome}) vence em: ${c.dataFim.toISOString()}`));

    for (const contract of contracts) {
      await this.createExpiryAlert(contract);
    }
  }

  /**
   * Cria um alerta no banco e envia e-mail se permitido
   */
  private static async createExpiryAlert(contract: any) {
    const alertMessage = `O contrato #${contract.numeroContrato} (${contract.inquilino.nome}) vence em breve.`;

    // 1. Verifica se já existe um alerta de vencimento ATIVO para este contrato
    // para evitar duplicidade
    const existingAlert = await prisma.alert.findFirst({
      where: {
        contratoId: contract.id,
        tipo: 'VENCIMENTO',
        status: 'ATIVO',
        imobiliariaId: contract.imobiliariaId,
      }
    });

    if (existingAlert) {
      console.log(`⚠️ Alerta já ativo para #${contract.numeroContrato}.`);
      return;
    }

    // 2. Registra o alerta no banco de dados
    const alert = await prisma.alert.create({
      data: {
        contratoId: contract.id,
        imobiliariaId: contract.imobiliariaId,
        tipo: 'VENCIMENTO',
        mensagem: alertMessage,
        dataEvento: contract.dataFim,
        status: 'ATIVO',
      }
    });

    console.log(`✅ Alerta criado: ID ${alert.id} para #${contract.numeroContrato}`);

    // 3. Busca usuários administradores/gestores para notificar via e-mail
    const usersToNotify = await prisma.user.findMany({
      where: {
        status: 'ATIVO',
        imobiliariaId: contract.imobiliariaId
      },
      include: {
        notificationPreferences: {
          where: { tipoAlerta: 'VENCIMENTO' }
        }
      }
    });

    console.log(`👥 Notificando ${usersToNotify.length} usuários via e-mail.`);

    for (const user of usersToNotify) {
      const preference = user.notificationPreferences[0];
      const isEmailEnabled = preference ? preference.emailEnabled : true;

      if (isEmailEnabled) {
        try {
          console.log(`📧 Tentando enviar e-mail para: ${user.email} (via ${process.env.EMAIL_FROM || 'onboarding@resend.dev'})`);

          const html = EmailService.generateContractExpiryTemplate({
            inquilino: contract.inquilino.nome,
            imovel: contract.imovel.endereco,
            dataVencimento: contract.dataFim.toLocaleDateString('pt-BR'),
            linkContrato: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/contratos/${contract.id}`
          });

          const res = await EmailService.sendEmail(
            user.email,
            `Alerta de Vencimento: #${contract.numeroContrato}`,
            html
          );
          console.log(`🚀 Resposta Resend para ${user.email}:`, res);
        } catch (error) {
          console.error(`❌ Erro no envio para ${user.email}:`, error);
        }
      } else {
        console.log(`🔕 E-mail desativado nas preferências de ${user.email}`);
      }
    }
  }
}
