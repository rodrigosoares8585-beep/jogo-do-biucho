const admin = require("firebase-admin");

module.exports = async function handler(req, res) {
  console.log("🚀 API Criar Pix iniciada");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificação de segurança do ambiente
    if (!globalThis.fetch) {
      throw new Error("A função 'fetch' não está disponível. Atualize a versão do Node.js na Vercel para 18.x ou superior.");
    }

    // Inicialização movida para dentro do handler para capturar erros de configuração
    if (!admin.apps.length) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY ausente");

      // 1. Remove aspas extras
      privateKey = privateKey.replace(/^"|"$/g, '');

      // 2. Corrige cabeçalhos colados (Erro específico da sua chave)
      if (privateKey.includes('-----BEGINPRIVATEKEY-----')) {
        privateKey = privateKey.replace('-----BEGINPRIVATEKEY-----', '-----BEGIN PRIVATE KEY-----\n');
        privateKey = privateKey.replace('-----ENDPRIVATEKEY-----', '\n-----END PRIVATE KEY-----');
      }

      // 3. Corrige quebras de linha (\n literal -> real) e espaços
      privateKey = privateKey.replace(/\\n/g, '\n').trim();

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    const db = admin.firestore();

    const { transacaoId, valor, usuario } = req.body;

    if (!usuario) {
      throw new Error("Dados do usuário não recebidos no corpo da requisição.");
    }

    // 1. Buscar Token do Mercado Pago no Firestore
    const configDoc = await db.collection("configuracoes").doc("pagamentos").get();
    const config = configDoc.data();

    if (!config || !config.mercadopago || !config.mercadopago.token) {
      console.error("❌ ERRO: Token Mercado Pago não configurado.");
      return res.status(500).json({ error: "Token do Mercado Pago não configurado no Painel Admin." });
    }

    let token = config.mercadopago.token.trim();

    // CORREÇÃO: Remove "Bearer" se o usuário colou junto com o token
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }
    
    // Monta a URL do Webhook e loga para conferência
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const webhookUrl = `${protocol}://${host}/api/webhook`;
    
    console.log(`🚀 Criando Pix... Webhook URL configurada: ${webhookUrl}`);
    
    // 2. Montar o pedido para o Mercado Pago
    const bodyMP = {
      transaction_amount: parseFloat(valor),
      description: "Creditos Jogo",
      payment_method_id: "pix",
      payer: {
        email: usuario.email || "email@generico.com",
        first_name: usuario.nome ? usuario.nome.split(' ')[0] : "Cliente",
        last_name: "Usuario"
      },
      external_reference: transacaoId,
      notification_url: webhookUrl
    };

    // 3. Enviar para o Mercado Pago
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Idempotency-Key": transacaoId
      },
      body: JSON.stringify(bodyMP)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", JSON.stringify(data));
      const msgErro = data.message || "Erro ao criar Pix no Mercado Pago";
      return res.status(400).json({ error: msgErro, details: data });
    }

    // 4. Extrair dados do QR Code
    const qrCodeBase64 = data.point_of_interaction.transaction_data.qr_code_base64;
    const qrCodeText = data.point_of_interaction.transaction_data.qr_code;
    
    return res.status(200).json({
      qr_code_image: `data:image/png;base64,${qrCodeBase64}`,
      qr_code_text: qrCodeText
    });

  } catch (error) {
    console.error("❌ Erro interno na API:", error);
    return res.status(500).json({ 
      error: error.message || "Erro interno no servidor",
      stack: error.stack 
    });
  }
};