// api/webhook.js
// Este código roda no servidor da Vercel (Gratuito)
// Ele recebe o aviso do PagBank e atualiza o Firebase

const admin = require("firebase-admin");

// Inicializa o Firebase Admin apenas uma vez
if (!admin.apps.length) {
  // Você precisará configurar essas variáveis de ambiente na Vercel
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Corrige a formatação da chave privada vinda das variáveis de ambiente
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Permite apenas método POST (que é o que o PagBank/MP envia)
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = req.body;
    console.log("🔔 Webhook recebido:", JSON.stringify(body));

    // LÓGICA PARA PAGBANK (Exemplo simplificado)
    // O PagBank envia um JSON com o status e o reference_id (que é o ID da nossa transação)
    // A estrutura exata depende da versão da API do PagBank, verifique a documentação.
    
    let transacaoId = body.reference_id || body.id; 
    let statusPagamento = body.status || body.charges?.[0]?.status;

    // Verifica se foi pago
    if (statusPagamento === "PAID" || statusPagamento === "COMPLETED" || statusPagamento === "approved") {
      
      if (!transacaoId) {
        return res.status(400).json({ error: "ID da transação não encontrado no webhook" });
      }

      const transacaoRef = db.collection("transacoes").doc(transacaoId);
      const transacaoDoc = await transacaoRef.get();

      if (!transacaoDoc.exists) {
        return res.status(404).json({ error: "Transação não encontrada no sistema" });
      }

      const transacao = transacaoDoc.data();

      // Evita pagar duas vezes
      if (transacao.status === "Aprovado") {
        return res.status(200).json({ message: "Já processado anteriormente" });
      }

      // 1. Atualiza status da transação
      await transacaoRef.update({ status: "Aprovado" });

      // 2. Adiciona saldo ao usuário
      const userRef = db.collection("usuarios").doc(transacao.userId);
      await userRef.update({
        saldo: admin.firestore.FieldValue.increment(transacao.valor)
      });

      // 3. Atualiza financeiro do admin
      const financeiroRef = db.collection("configuracoes").doc("financeiro");
      await financeiroRef.update({
        totalDepositosProcessados: admin.firestore.FieldValue.increment(transacao.valor),
        caixaNormalAtual: admin.firestore.FieldValue.increment(transacao.valor)
      });

      return res.status(200).json({ message: "Pagamento aprovado com sucesso" });
    }

    return res.status(200).json({ message: "Status recebido, mas não é aprovação", status: statusPagamento });

  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
