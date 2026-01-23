// api/webhook.js
const admin = require("firebase-admin");

module.exports = async function handler(req, res) {
  // 1. Log Inicial para saber se o PagBank chegou aqui
  console.log(`🔔 Webhook ACIONADO! Método: ${req.method}`);

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // 2. Inicialização Segura do Firebase (dentro do try/catch)
    if (!admin.apps.length) {
      // 1. Pega a chave bruta
      const rawKey = process.env.FIREBASE_PRIVATE_KEY;
      if (!rawKey) throw new Error("FIREBASE_PRIVATE_KEY ausente");

      // 2. Limpeza agressiva: converte \n e remove aspas extras
      const privateKey = rawKey.replace(/\\n/g, '\n').replace(/^"|"$/g, '');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    
    const db = admin.firestore();
    const body = req.body;
    
    // 3. Log do Payload (O que o banco mandou?)
    console.log("📦 Payload Recebido:", JSON.stringify(body, null, 2));

    // 4. Extração Inteligente de Dados (Tenta vários formatos)
    let transacaoId = body.reference_id || body.id; 
    let statusPagamento = body.status;
    
    // Se for o formato novo (charges), pega de dentro
    if (!statusPagamento && body.charges && body.charges.length > 0) {
      statusPagamento = body.charges[0].status;
      if (!transacaoId) transacaoId = body.charges[0].reference_id;
    }

    console.log(`ℹ️ Processando ID: ${transacaoId} | Status: ${statusPagamento}`);

    const statusNormalizado = statusPagamento ? statusPagamento.toUpperCase() : "DESCONHECIDO";

    // Verifica se foi pago
    if (["PAID", "COMPLETED", "APPROVED"].includes(statusNormalizado)) {
      
      if (!transacaoId) {
        console.error("❌ ID da transação não encontrado no payload.");
        return res.status(400).json({ error: "ID da transação não encontrado no webhook" });
      }

      const transacaoRef = db.collection("transacoes").doc(transacaoId);
      const transacaoDoc = await transacaoRef.get();

      if (!transacaoDoc.exists) {
        console.error(`❌ Transação ${transacaoId} não existe no banco de dados.`);
        return res.status(404).json({ error: "Transação não encontrada no sistema" });
      }

      const transacao = transacaoDoc.data();

      // Evita pagar duas vezes
      if (transacao.status === "Aprovado") {
        console.log("⚠️ Transação já estava aprovada. Ignorando.");
        return res.status(200).json({ message: "Já processado anteriormente" });
      }

      console.log(`✅ Aprovando transação de R$ ${transacao.valor}...`);

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

      console.log("🎉 Sucesso! Saldo liberado.");
      return res.status(200).json({ message: "Pagamento aprovado com sucesso" });
    }

    console.log(`ℹ️ Status ${statusNormalizado} não é de aprovação. Nada a fazer.`);
    return res.status(200).json({ message: "Status recebido", status: statusNormalizado });

  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
