// ========================
// SISTEMA DE PAGAMENTOS
// ========================

const TAXA_SAQUE = 0.02; // 2%
const SAQUE_MINIMO = 50;
const DEPOSITO_MINIMO = 10;

// Função auxiliar para esperar o Firebase carregar
async function aguardarFirebase() {
  if (window.db) return;
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (window.db) { clearInterval(check); resolve(); }
    }, 100);
  });
}

// Ao carregar
window.addEventListener("load", () => {
  carregarHistorico();
  atualizarSaldoDisponivel();
  sincronizarConfiguracoes();
});

// ==================
// DEPÓSITOS
// ==================

function depositar(metodo) {
  const usuario = obterUsuario();
  if (!usuario) return alert("Faça login primeiro!");

  let valor = 0;

  if (metodo === "mercadopago") {
    valor = parseFloat(document.getElementById("valor-mp").value);
  } else if (metodo === "stripe") {
    valor = parseFloat(document.getElementById("valor-stripe").value);
  } else if (metodo === "pagbank") {
    valor = parseFloat(document.getElementById("valor-pagbank").value);
  }

  if (!valor || valor < DEPOSITO_MINIMO) {
    alert(`Valor mínimo: R$ ${DEPOSITO_MINIMO}`);
    return;
  }

  if (metodo === "mercadopago") {
    processarMercadoPago(valor);
  } else if (metodo === "stripe") {
    processarStripe(valor);
  } else if (metodo === "pagbank") {
    processarPagBank(valor);
  }
}

function processarMercadoPago(valor) {
  const numeroTransacao = gerarTransacao();
  const config = JSON.parse(localStorage.getItem("config_pagamentos")) || {};
  
  let mensagem = `🔗 Redirecionando para Mercado Pago...\n\n` +
    `Valor: R$ ${valor.toFixed(2)}\n` +
    `ID: ${numeroTransacao}\n`;

  if (config.mercadopago?.email) {
    mensagem += `\nDepositando para: ${config.mercadopago.email}`;
  }

  if (config.mercadopago?.pix) {
    mensagem += `\nChave PIX: ${config.mercadopago.pix}`;
  }

  mensagem += `\n\nPara testar: clique em "OK" e confirmaremos o depósito`;

  alert(mensagem);

  // Apenas registra como pendente
  confirmarDeposito(valor, "Mercado Pago");
  document.getElementById("valor-mp").value = "";
}

function processarPagBank(valor) {
  processarPagamentoAutomatico(valor, "PagBank");
}

function processarStripe(valor) {
  const numeroCartao = document.getElementById("numero-cartao").value;
  const nomeCartao = document.getElementById("nome-cartao").value;
  const cvv = document.getElementById("cvv").value;
  const validade = document.getElementById("validade").value;

  // Validações
  if (!numeroCartao || !nomeCartao || !cvv || !validade) {
    alert("Preencha todos os dados do cartão!");
    return;
  }

  if (!validarCartao(numeroCartao)) {
    alert("Número do cartão inválido!");
    return;
  }

  if (!validarValidade(validade)) {
    alert("Data de validade inválida (MM/YY)!");
    return;
  }

  if (cvv.length < 3) {
    alert("CVV inválido!");
    return;
  }

  // Simular processamento
  const numeroTransacao = gerarTransacao();
  alert(
    `💳 Processando Stripe...\n\n` +
    `Valor: R$ ${valor.toFixed(2)}\n` +
    `Cartão: ****${numeroCartao.slice(-4)}\n` +
    `ID: ${numeroTransacao}`
  );

  confirmarDeposito(valor, "Stripe (Cartão)");
  limparFormularioCartao();
  document.getElementById("valor-stripe").value = "";
}

function depositarPix() {
  const valor = parseFloat(document.getElementById("valor-pix").value);

  if (!valor || valor < DEPOSITO_MINIMO) {
    alert(`Valor mínimo: R$ ${DEPOSITO_MINIMO}`);
    return;
  }

  processarPagamentoAutomatico(valor, "PIX");
}

function confirmarPix() {
  // Função mantida apenas para compatibilidade se o botão for clicado manualmente
  fecharModalPix();
}

function fecharModalPix() {
  document.getElementById("modal-pix").style.display = "none";
}

function confirmarDeposito(valor, metodo) {
  const usuario = obterUsuario();
  
  // Registra a transação como "Pendente" para o admin aprovar
  registrarTransacao(valor, "Deposito", metodo, "Pendente", usuario);
  
  alert(`✅ Solicitação de depósito enviada!\n\nValor: R$ ${valor.toFixed(2)}\n\nO saldo será liberado após a confirmação do administrador.`);
}

// ==============================
// PAGAMENTO AUTOMÁTICO (NOVO)
// ==============================

async function processarPagamentoAutomatico(valor, metodo) {
  const usuario = obterUsuario();
  if (!usuario) return alert("Faça login!");

  const transacaoId = gerarTransacao();
  
  // 1. Criar transação PENDENTE no Firebase
  const transacao = {
    id: transacaoId,
    userId: usuario.id,
    usuarioNome: usuario.nome,
    usuarioEmail: usuario.email,
    tipo: "Depósito",
    valor: valor,
    metodo: metodo,
    status: "Pendente",
    data: new Date().toLocaleString("pt-BR"),
    timestamp: Date.now()
  };

  try {
    await aguardarFirebase();
    await window.setDoc(window.doc(window.db, "transacoes", transacaoId), transacao);
    
    const modal = document.getElementById("modal-pix");
    const qrContainer = document.getElementById("qr-code-pix");
    const chaveContainer = document.getElementById("chave-pix");
    const btnConfirmar = document.querySelector(".btn-confirmar-pix");

    // 2. Chamar API para gerar Pix Real
    qrContainer.innerHTML = '<p style="color:#fff">Gerando Pix no Banco...</p>';
    modal.style.display = "block";

    const response = await fetch('/api/criar-pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transacaoId: transacaoId,
        valor: valor,
        usuario: { nome: usuario.nome, email: usuario.email }
      })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Se não for JSON, provavelmente é a página de erro padrão da Vercel (HTML)
      console.error("Erro não-JSON da API:", responseText);
      throw new Error(`Erro no Servidor (${response.status}). Verifique os logs da Vercel.`);
    }

    if (!response.ok) {
      // Se der erro (ex: Token inválido), mostra alerta e fecha modal
      document.getElementById("modal-pix").style.display = "none";
      if (btnConfirmar) btnConfirmar.innerText = textoOriginalBtn;
      throw new Error(data.error || "Erro desconhecido ao comunicar com o banco.");
    }

    // Exibir QR Code Real
    qrContainer.innerHTML = `<img src="${data.qr_code_image}" alt="QR Code Pagamento" style="border-radius:8px; box-shadow: 0 0 15px rgba(0,255,213,0.2); width: 200px;">`;
    
    // Exibir Copia e Cola
    chaveContainer.innerHTML = `
      <div style="margin-bottom:10px; word-break: break-all; font-size: 10px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px;">${data.qr_code_text}</div>
      <button onclick="navigator.clipboard.writeText('${data.qr_code_text}'); alert('Copiado!')" style="padding:5px 10px; cursor:pointer; border:none; border-radius:4px; background:#00ffd5; color:#000; font-weight:bold;">Copiar Código Pix</button>
      <br><br>
      <small>Aguardando confirmação automática...</small>
    `;
    
    // Ajustar botão para estado de "Aguardando"
    const textoOriginalBtn = btnConfirmar ? btnConfirmar.innerText : "Já Transferi";
    if (btnConfirmar) {
      btnConfirmar.innerText = "⏳ Aguardando Banco...";
    }

    // 3. ESCUTA EM TEMPO REAL (BACKEND REAL)
    // O site fica ouvindo o Firebase. Quando o backend (Vercel) atualizar para "Aprovado", o site libera.
    console.log("⏳ Aguardando confirmação do banco (Webhook)...");
    
    const unsubscribe = window.onSnapshot(window.doc(window.db, "transacoes", transacaoId), async (doc) => {
      if (doc.exists()) {
        const dados = doc.data();
        if (dados.status === "Aprovado") {
          unsubscribe(); // Para de ouvir
          
          // Atualiza saldo na tela (o backend já deve ter somado)
          if (typeof verificarSessao === 'function') await verificarSessao();
          
          // Restaurar botão e limpar
          if (btnConfirmar) {
            btnConfirmar.innerText = textoOriginalBtn;
            btnConfirmar.disabled = false;
            btnConfirmar.style.opacity = "1";
            btnConfirmar.style.cursor = "pointer";
          }
          
          const inputPagbank = document.getElementById("valor-pagbank");
          const inputPix = document.getElementById("valor-pix");
          if (inputPagbank) inputPagbank.value = "";
          if (inputPix) inputPix.value = "";

          document.getElementById("modal-pix").style.display = "none";
          alert(`✅ PAGAMENTO CONFIRMADO!\n\nO pagamento foi processado pelo banco e creditado.`);
          carregarHistorico();
        }
      }
    });

  } catch (e) {
    console.error("Erro ao processar automático:", e);
    alert("Erro ao iniciar transação: " + e.message);
  }
}

async function aprovarTransacaoAutomaticamente(transacaoId, valor, userId) {
  try {
    // Verificar se já não foi aprovado
    const transacaoRef = window.doc(window.db, "transacoes", transacaoId);
    const docSnap = await window.getDoc(transacaoRef);
    
    if (docSnap.exists() && docSnap.data().status === "Aprovado") return;

    // 1. Atualizar status para Aprovado
    await window.updateDoc(transacaoRef, { status: "Aprovado" });

    // 2. Atualizar saldo do usuário
    const userRef = window.doc(window.db, "usuarios", userId);
    const userSnap = await window.getDoc(userRef);
    
    if (userSnap.exists()) {
      const saldoAtual = userSnap.data().saldo || 0;
      const novoSaldo = saldoAtual + valor;
      
      await window.updateDoc(userRef, { saldo: novoSaldo });
      
      // Atualiza na sessão local se for o usuário logado
      const usuarioLogado = obterUsuario();
      if (usuarioLogado && usuarioLogado.id === userId) {
        usuarioLogado.saldo = novoSaldo;
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
        
        // Atualiza interface
        if (typeof window.atualizarSaldo === 'function') {
            window.atualizarSaldo(novoSaldo);
        } else {
            const elSaldo = document.getElementById("user-saldo");
            if (elSaldo) elSaldo.textContent = novoSaldo.toFixed(2);
            atualizarSaldoDisponivel();
        }
      }
    }

    // 3. Atualizar Financeiro (Estatísticas Admin)
    try {
      const financeiroRef = window.doc(window.db, "configuracoes", "financeiro");
      const financeiroSnap = await window.getDoc(financeiroRef);
      let finData = financeiroSnap.exists() ? financeiroSnap.data() : {};
      
      finData.totalDepositosProcessados = (finData.totalDepositosProcessados || 0) + valor;
      finData.caixaNormalAtual = (finData.caixaNormalAtual || 0) + valor;
      
      await window.setDoc(financeiroRef, finData, { merge: true });
    } catch (err) {
      console.warn("Erro ao atualizar financeiro:", err);
    }

    // 4. Fechar modal e notificar
    document.getElementById("modal-pix").style.display = "none";
    alert(`✅ PAGAMENTO CONFIRMADO!\n\nO valor de R$ ${valor.toFixed(2)} foi creditado na sua conta automaticamente.`);
    
    carregarHistorico();

  } catch (e) {
    console.error("Erro na aprovação automática:", e);
    alert("Erro ao confirmar pagamento automaticamente.");
  }
}

// ==================
// SAQUES
// ==================

function solicitarSaque() {
  const usuario = obterUsuario();
  if (!usuario) return alert("Faça login primeiro!");

  // Verificar se tem dados bancários cadastrados
  const dadosBancarios = JSON.parse(localStorage.getItem(`dados_bancarios_${usuario.id}`));
  if (!dadosBancarios) {
    alert("❌ Você precisa cadastrar seus dados bancários para sacar!\n\nClique em 'Ir para Banco' para configurar.");
    return;
  }

  const valor = parseFloat(document.getElementById("valor-saque").value);
  const metodo = document.querySelector('input[name="metodo-saque"]:checked').value;

  if (!valor || valor < SAQUE_MINIMO) {
    alert(`Valor mínimo: R$ ${SAQUE_MINIMO}`);
    return;
  }

  if (valor > usuario.saldo) {
    alert("Saldo insuficiente!");
    return;
  }

  const taxa = valor * TAXA_SAQUE;
  const valorFinal = valor - taxa;

  const confirmacao = confirm(
    `Saque de R$ ${valor.toFixed(2)}\n` +
    `Taxa: R$ ${taxa.toFixed(2)}\n` +
    `Você receberá: R$ ${valorFinal.toFixed(2)}\n\n` +
    `Método: ${metodo.toUpperCase()}\n` +
    `Conta: ${obterNomeBancoSaque(dadosBancarios.banco)}\n\n` +
    `Confirma?`
  );

  if (!confirmacao) return;

  // Processar saque
  const novoSaldo = usuario.saldo - valor;
  atualizarSaldo(novoSaldo);
  atualizarSaldoDisponivel();

  registrarTransacao(valor, "Saque", metodo, "Pendente", usuario);
  document.getElementById("valor-saque").value = "";

  alert(`✅ Saque solicitado com sucesso!\n\nValor líquido: R$ ${valorFinal.toFixed(2)}\nVocê receberá em 1-3 dias úteis\n\nConta: ${dadosBancarios.banco}`);
}

function obterNomeBancoSaque(codigo) {
  const bancos = {
    "001": "Banco do Brasil",
    "033": "Santander",
    "104": "Caixa Econômica",
    "237": "Bradesco",
    "341": "Itaú",
    "389": "Banco Mercantil",
    "392": "Barclays",
    "422": "Banco Safra",
    "480": "Banco de Brasília",
    "633": "Banco Rendimento",
    "655": "Banco Votorantim",
    "745": "Banco Citibank",
    "999": "Outro"
  };
  return bancos[codigo] || "Banco desconhecido";
}

// ==================
// HISTÓRICO
// ==================

async function registrarTransacao(valor, tipo, metodo, status, usuario) {
  if (!usuario) usuario = obterUsuario();

  const transacao = {
    id: gerarTransacao(),
    userId: usuario.id,
    usuarioNome: usuario.nome,
    usuarioEmail: usuario.email,
    tipo: tipo,
    valor: valor,
    metodo: metodo,
    status: status,
    data: new Date().toLocaleString("pt-BR"),
    timestamp: Date.now()
  };

  try {
    await aguardarFirebase();
    await window.setDoc(window.doc(window.db, "transacoes", transacao.id), transacao);
    carregarHistorico();
  } catch (e) {
    console.error("Erro ao salvar transação:", e);
  }
}

async function carregarHistorico() {
  const usuario = obterUsuario();
  if (!usuario) return;

  // const transacoes = JSON.parse(localStorage.getItem(`transacoes_${usuario.id}`)) || [];
  const container = document.getElementById("historico-transacoes");
  if (!container) return;
  container.innerHTML = '<p class="vazio">Carregando...</p>';

  try {
    await aguardarFirebase();
    const q = window.query(
      window.collection(window.db, "transacoes"),
      window.where("userId", "==", usuario.id)
    );
    
    const querySnapshot = await window.getDocs(q);
    const transacoes = [];
    querySnapshot.forEach((doc) => {
      transacoes.push(doc.data());
    });

  if (transacoes.length === 0) {
    container.innerHTML = '<p class="vazio">Nenhuma transação realizada ainda</p>';
    return;
  }

  // Ordenar por data decrescente
  transacoes.sort((a, b) => b.timestamp - a.timestamp);

  container.innerHTML = transacoes.map(t => `
    <div class="transacao ${t.status.toLowerCase()}">
      <div class="trans-info">
        <strong>${t.tipo}</strong>
        <small>${t.metodo}</small>
      </div>
      <div class="trans-valor">
        <span class="valor">${t.tipo === "Depósito" ? "+" : "-"} R$ ${t.valor.toFixed(2)}</span>
        <span class="status">${t.status}</span>
      </div>
      <div class="trans-data">${t.data}</div>
    </div>
  `).join("");

  } catch (e) {
    console.error("Erro ao carregar histórico:", e);
    container.innerHTML = '<p class="vazio">Erro ao carregar histórico.</p>';
  }
}

function atualizarSaldoDisponivel() {
  const usuario = obterUsuario();
  if (usuario) {
    document.getElementById("saldo-disponivel").textContent = usuario.saldo.toFixed(2);
  }
}

// ==================
// UTILIDADES
// ==================

function validarCartao(numero) {
  // Algoritmo de Luhn simplificado
  numero = numero.replace(/\D/g, "");
  if (numero.length < 13 || numero.length > 19) return false;
  
  let soma = 0;
  for (let i = 0; i < numero.length; i++) {
    let digito = parseInt(numero[numero.length - 1 - i]);
    if (i % 2 === 1) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    soma += digito;
  }
  return soma % 10 === 0;
}

function gerarTransacao() {
  return 'TRX' + Date.now() + Math.floor(Math.random() * 1000);
}