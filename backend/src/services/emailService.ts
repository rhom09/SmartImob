import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export class EmailService {
  /**
   * Envia um e-mail formatado
   */
  static async sendEmail(to: string, subject: string, html: string) {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY não configurada. E-mail não enviado:', { to, subject });
        return null;
      }

      const { data, error } = await resend.emails.send({
        from: `SmartImob <${fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('❌ Erro ao enviar e-mail via Resend:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Falha crítica no EmailService:', error);
      throw error;
    }
  }

  /**
   * Template para alerta de vencimento de contrato
   */
  static generateContractExpiryTemplate(params: {
    inquilino: string;
    imovel: string;
    dataVencimento: string;
    linkContrato: string;
  }) {
    return `
      <div style="font-family: sans-serif; color: #191c1e; max-width: 600px; margin: 0 auto; border: 1px solid #e0e3e5; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #040d23; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Alerta de Vencimento</h1>
        </div>
        <div style="padding: 24px; line-height: 1.6;">
          <p>Olá, <strong>Gestor</strong>,</p>
          <p>Identificamos um contrato com vencimento próximo que requer sua atenção:</p>

          <div style="background-color: #f7f9fb; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Inquilino:</strong> ${params.inquilino}</p>
            <p style="margin: 4px 0;"><strong>Imóvel:</strong> ${params.imovel}</p>
            <p style="margin: 4px 0;"><strong>Vencimento:</strong> ${params.dataVencimento}</p>
          </div>

          <p>Recomendamos entrar em contato com o inquilino para negociar a renovação ou preparar a vistoria de saída.</p>

          <div style="text-align: center; margin-top: 32px;">
            <a href="${params.linkContrato}" style="background-color: #5e5adb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Ver Detalhes do Contrato</a>
          </div>
        </div>
        <div style="background-color: #f7f9fb; padding: 16px; text-align: center; font-size: 12px; color: #45464d; border-top: 1px solid #e0e3e5;">
          Este é um e-mail automático gerado pelo SmartImob.
        </div>
      </div>
    `;
  }
}
