const admin = require("firebase-admin");

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Inicialização movida para dentro do handler para capturar erros de configuração
    if (!admin.apps.length) {
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error("Configuração do Firebase ausente (FIREBASE_PRIVATE_KEY). Verifique as variáveis de ambiente na Vercel.");
      }
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    const db = admin.firestore();

    const { transacaoId, valor, usuario } = req.body;

    // 1. Buscar Token do PagBank no Firestore (Configurado no Painel Admin)
    const configDoc = await db.collection("configuracoes").doc("pagamentos").get();
    const config = configDoc.data();

    if (!config || !config.pagbank || !config.pagbank.token) {
      return res.status(500).json({ error: "Token do PagBank não configurado no Painel Admin." });
    }

    const token = config.pagbank.token;
    
    // Monta a URL do Webhook e loga para conferência
    const webhookUrl = `https://${req.headers.host}/api/webhook`;
    console.log(`🚀 Criando Pix... Webhook URL configurada: ${webhookUrl}`);
    
    // 2. Montar o pedido para o PagBank
    const bodyPagBank = {
      reference_id: transacaoId,
      customer: {
        name: usuario.nome || "Cliente",
        email: usuario.email || "cliente@email.com",
        tax_id: "12345678909", // CPF genérico exigido pelo PagBank
        phones: [{ country: "55", area: "11", number: "999999999", type: "MOBILE" }]
      },
      items: [{
        name: "Creditos Jogo",
        quantity: 1,
        unit_amount: Math.round(valor * 100) // Valor em centavos
      }],
      qr_codes: [{
        amount: { value: Math.round(valor * 100) },
        expiration_date: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hora de validade
      }],
      notification_urls: [
        webhookUrl // Onde o PagBank vai avisar
      ]
    };

    // 3. Enviar para o PagBank
    const response = await fetch("https://api.pagseguro.com/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(bodyPagBank)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro PagBank:", JSON.stringify(data));
      return res.status(400).json({ error: "Erro ao criar Pix no PagBank", details: data });
    }

    // 4. Extrair dados do QR Code
    const qrCodeInfo = data.qr_codes[0];
    const linkImagem = qrCodeInfo.links.find(l => l.rel === "QRCODE.PNG").href;
    
    return res.status(200).json({
      qr_code_image: linkImagem,
      qr_code_text: qrCodeInfo.text
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: error.message });
  }
};