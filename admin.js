// ==============================
// PAINEL ADMINISTRATIVO
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  // 1. GUARDA DE SEGURANÇA
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuarioLogado || !usuarioLogado.isAdmin) {
    alert("🚫 Acesso negado! Área restrita.");
    document.body.style.display = 'none';
    window.location.href = "index.html";
    return;
  }

  // 2. Inicialização
  if (document.querySelector(".usuarios-lista")) {
    carregarUsuariosAdmin();
    carregarConfirmacoesPendentes();
    carregarConfiguracoesPagamento();
    
    // Filtro de busca de usuários
    const buscaInput = document.querySelector(".usuarios-filtro input");
    if (buscaInput) {
      buscaInput.addEventListener("input", (e) => carregarUsuariosAdmin(e.target.value));
    }

    iniciarAgendadorDeRelatorio(); // Inicia o verificador de agendamento de relatório
  }
});

// Função auxiliar para esperar o Firebase carregar
async function aguardarFirebase() {
  if (window.db && window.query) return;
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (window.db && window.query) { clearInterval(check); resolve(); }
    }, 100);
  });
}

// ==============================
// NAVEGAÇÃO (ABAS)
// ==============================

window.abrirAba = function(abaId) {
  // Esconde todas as abas
  document.querySelectorAll('.aba-admin').forEach(aba => aba.classList.remove('active'));
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

  // Mostra aba e ativa menu
  document.getElementById(`aba-${abaId}`)?.classList.add('active');
  document.querySelector(`button[onclick="abrirAba('${abaId}')"]`)?.classList.add('active');

  // Recarrega dados se necessário
  if (abaId === 'usuarios') carregarUsuariosAdmin();
  if (abaId === 'relatorios') carregarRelatoriosAdmin();
  if (abaId === 'confirmacoes') carregarConfirmacoesPendentes();
  if (abaId === 'transacoes') filtrarTransacoes();
  if (abaId === 'contas') carregarConfiguracoesPagamento();
};

window.voltarHome = function() {
  window.location.href = "index.html";
};

window.abrirAbaPendente = function(tipo) {
  document.querySelectorAll('.tab-confirmacao').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tipo}`)?.classList.add('active');
  document.querySelector(`button[onclick="abrirAbaPendente('${tipo}')"]`)?.classList.add('active');
};

// ==============================
// GERENCIAMENTO DE USUÁRIOS
// ==============================

async function carregarUsuariosAdmin(termo = "") {
  const container = document.querySelector(".usuarios-lista");
  if (!container) return;

  container.innerHTML = '<p class="vazio">Carregando usuários...</p>';

  try {
    await aguardarFirebase(); // Espera conexão
    // Busca usuários do Firestore
    const querySnapshot = await window.getDocs(window.collection(window.db, "usuarios"));
    const usuarios = [];
    querySnapshot.forEach((doc) => {
      usuarios.push(doc.data());
    });

    const termoBusca = termo.toLowerCase();
    container.innerHTML = "";

    const filtrados = usuarios.filter(u => 
      !termoBusca || 
      (u.nome && u.nome.toLowerCase().includes(termoBusca)) || 
      (u.email && u.email.toLowerCase().includes(termoBusca))
    );

    if (filtrados.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhum usuário encontrado.</p>';
      return;
    }

    filtrados.forEach(usuario => {
      const card = document.createElement("div");
      card.className = `usuario-card ${usuario.bloqueado ? 'bloqueado' : ''}`;
      
      card.innerHTML = `
        <div class="usuario-info">
          <strong>${usuario.nome} ${usuario.bloqueado ? '(BLOQUEADO)' : ''} ${usuario.isAdmin ? '👑' : ''}</strong>
          <p>${usuario.email}</p>
          <small>ID: ${usuario.id}</small>
        </div>
        <div class="usuario-dados">
          <div class="dado"><strong>Saldo:</strong> R$ ${usuario.saldo.toFixed(2)}</div>
          <div class="dado"><strong>Criado:</strong> ${usuario.criadoEm}</div>
        </div>
        <div class="acoes-usuario">
          <button class="btn-admin btn-bloquear" onclick="toggleBloqueioUsuario('${usuario.id}')">
            ${usuario.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}
          </button>
          <button class="btn-admin btn-excluir" onclick="excluirUsuario('${usuario.id}')">
            🗑️ Excluir
          </button>
        </div>
      `;
      
      container.appendChild(card);
    });
  } catch (e) {
    console.error("Erro ao carregar usuários:", e);
    container.innerHTML = '<p class="vazio">Erro ao carregar usuários.</p>';
  }
}

window.toggleBloqueioUsuario = async function(id) {
  try {
    const docRef = window.doc(window.db, "usuarios", id);
    const docSnap = await window.getDoc(docRef);
    if (docSnap.exists()) {
      const statusAtual = docSnap.data().bloqueado || false;
      await window.updateDoc(docRef, { bloqueado: !statusAtual });
      carregarUsuariosAdmin(document.querySelector(".usuarios-filtro input")?.value);
    }
  } catch (e) {
    alert("Erro ao atualizar status: " + e.message);
  }
};

window.excluirUsuario = async function(id) {
  if (confirm("⚠️ Excluir usuário permanentemente?")) {
    try {
      await window.deleteDoc(window.doc(window.db, "usuarios", id));
    
      // LIMPEZA DE DADOS RELACIONADOS
      localStorage.removeItem(`transacoes_${id}`);
      localStorage.removeItem(`dados_bancarios_${id}`);
      
      // Se o usuário excluiu a si mesmo, faz logout
      const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
      if (usuarioLogado && usuarioLogado.id === id) {
        localStorage.removeItem("usuarioLogado");
        alert("Sua conta foi excluída.");
        window.location.href = "auth.html";
        return;
      }

      carregarUsuariosAdmin(document.querySelector(".usuarios-filtro input")?.value);
    } catch (e) {
      alert("Erro ao excluir usuário: " + e.message);
    }
  }
};

// ==============================
// CONFIRMAÇÕES PENDENTES
// ==============================

async function carregarConfirmacoesPendentes() {
  const divDepositos = document.getElementById("depositos-pendentes");
  const divSaques = document.getElementById("saques-pendentes");
  
  // Adiciona botão de atualizar se não existir
  const tabsContainer = document.querySelector('.confirmacoes-tabs');
  if (tabsContainer && !document.getElementById('btn-refresh-conf')) {
    const btn = document.createElement('button');
    btn.id = 'btn-refresh-conf';
    btn.className = 'btn-admin';
    btn.style.marginLeft = 'auto';
    btn.style.background = 'rgba(0, 255, 213, 0.1)';
    btn.style.color = '#00ffd5';
    btn.innerHTML = '🔄 Atualizar Lista';
    btn.onclick = carregarConfirmacoesPendentes;
    tabsContainer.appendChild(btn);
  }
  
  if (divDepositos) divDepositos.innerHTML = '<p class="vazio">🔄 Buscando dados no Firebase...</p>';
  if (divSaques) divSaques.innerHTML = '<p class="vazio">🔄 Buscando dados no Firebase...</p>';

  try {
    await aguardarFirebase(); // Espera conexão
    
    console.log("🔍 Buscando transações pendentes...");
    
    const q = window.query(window.collection(window.db, "transacoes"), window.where("status", "==", "Pendente"));
    const querySnapshot = await window.getDocs(q);
    
    const pendentes = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      pendentes.push(data);
    });
    
    console.log(`✅ Encontradas: ${pendentes.length} transações pendentes.`);

    // Limpa os containers
    if (divDepositos) divDepositos.innerHTML = "";
    if (divSaques) divSaques.innerHTML = "";

    // Filtra por tipo (aceita com ou sem acento para evitar erros)
    const depositos = pendentes.filter(t => t.tipo === 'Depósito' || t.tipo === 'Deposito');
    const saques = pendentes.filter(t => t.tipo === 'Saque');

    // Renderiza Depósitos
    if (depositos.length === 0) {
      if (divDepositos) divDepositos.innerHTML = '<p class="vazio">Nenhum depósito pendente.</p>';
    } else {
      depositos.forEach(t => {
        if (divDepositos) divDepositos.appendChild(criarCardConfirmacao(t));
      });
    }

    // Renderiza Saques
    if (saques.length === 0) {
      if (divSaques) divSaques.innerHTML = '<p class="vazio">Nenhum saque pendente.</p>';
    } else {
      saques.forEach(t => {
        if (divSaques) divSaques.appendChild(criarCardConfirmacao(t));
      });
    }

  } catch (e) {
    console.error("Erro ao carregar confirmações:", e);
    if (divDepositos) divDepositos.innerHTML = `<p class="vazio" style="color:#ff6b6b">Erro: ${e.message}</p>`;
    if (divSaques) divSaques.innerHTML = `<p class="vazio" style="color:#ff6b6b">Erro: ${e.message}</p>`;
  }
}

function criarCardConfirmacao(t) {
  const card = document.createElement("div");
  card.className = `card-confirmacao ${t.tipo === 'Depósito' ? 'deposito' : 'saque'}`;
  card.innerHTML = `
    <div class="confirmacao-header">
      <div class="confirmacao-usuario">
        <strong>${t.usuarioNome || 'Usuário'}</strong>
        <small>${t.usuarioEmail || 'Email'}</small>
      </div>
      <div class="confirmacao-valor">
        <span class="valor">R$ ${t.valor.toFixed(2)}</span>
        <span class="data">${t.data}</span>
      </div>
    </div>
    <div class="confirmacao-info">
      <p><strong>Método:</strong> ${t.metodo}</p>
      <p><strong>ID:</strong> <code>${t.id}</code></p>
    </div>
    <div class="confirmacao-acoes">
      <button class="btn-confirmar" onclick="processarTransacao('${t.userId}', '${t.id}', 'aprovar')">✅ Aprovar</button>
      <button class="btn-rejeitar" onclick="processarTransacao('${t.userId}', '${t.id}', 'rejeitar')">❌ Rejeitar</button>
    </div>
  `;
  return card;
}

window.processarTransacao = async function(userId, transacaoId, acao) {
  try {
    const transacaoRef = window.doc(window.db, "transacoes", transacaoId);
    const transacaoSnap = await window.getDoc(transacaoRef);
    
    if (!transacaoSnap.exists()) return alert("Transação não encontrada!");
    const t = transacaoSnap.data();

    const userRef = window.doc(window.db, "usuarios", userId);
    const userSnap = await window.getDoc(userRef);
    if (!userSnap.exists()) return alert("Usuário não encontrado!");
    const usuario = userSnap.data();

    // Verificação para evitar duplo processamento
    if (t.status !== 'Pendente') return alert("Esta transação já foi processada!");

    if (acao === 'aprovar') {
      await window.updateDoc(transacaoRef, { status: 'Aprovado' });
      
      // Atualizar dados financeiros (Caixa)
      const financeiroRef = window.doc(window.db, "configuracoes", "financeiro");
      const financeiroSnap = await window.getDoc(financeiroRef);
      let finData = financeiroSnap.exists() ? financeiroSnap.data() : { totalDepositosProcessados: 0, totalSaquesProcessados: 0, caixaNormalAtual: 0 };
      const valorOp = parseFloat(t.valor);

      if (t.tipo === 'Depósito' || t.tipo === 'Deposito') {
        await window.updateDoc(userRef, { saldo: usuario.saldo + valorOp });
        
        // Atualiza total de depósitos (sempre)
        finData.totalDepositosProcessados = (finData.totalDepositosProcessados || 0) + valorOp;

        // Lógica de Fundo de Caixa vs Caixa Operacional
        const limiteFundo = finData.limiteFundoDeCaixa !== undefined ? Number(finData.limiteFundoDeCaixa) : 5000;
        let fundoAtual = finData.fundoDeCaixaAtual || 0;
        
        if (fundoAtual < limiteFundo) {
          const espacoRestante = limiteFundo - fundoAtual;
          
          if (valorOp <= espacoRestante) {
            // Cabe tudo no fundo de caixa
            finData.fundoDeCaixaAtual = fundoAtual + valorOp;
          } else {
            // Enche o fundo e o resto vai para o caixa normal
            finData.fundoDeCaixaAtual = limiteFundo;
            const excedente = valorOp - espacoRestante;
            finData.caixaNormalAtual = (finData.caixaNormalAtual || 0) + excedente;
          }
        } else {
          // Fundo cheio, vai tudo para o caixa normal
          finData.caixaNormalAtual = (finData.caixaNormalAtual || 0) + valorOp;
        }

      } else if (t.tipo === 'Saque') {
        // Saque já descontou do usuário na solicitação
        finData.totalSaquesProcessados = (finData.totalSaquesProcessados || 0) + valorOp;
        finData.caixaNormalAtual = (finData.caixaNormalAtual || 0) - valorOp;
      }
      
      await window.setDoc(financeiroRef, finData, { merge: true });
      alert("✅ Transação aprovada e saldo atualizado!");
    } else {
      await window.updateDoc(transacaoRef, { status: 'Rejeitado' });
      if (t.tipo === 'Saque') {
        await window.updateDoc(userRef, { saldo: usuario.saldo + parseFloat(t.valor) }); // Devolve o dinheiro
      }
      alert("❌ Transação rejeitada!");
    }
    carregarConfirmacoesPendentes();
  } catch (e) {
    alert("Erro ao processar: " + e.message);
  }
};

// ==============================
// CONFIGURAÇÕES DE PAGAMENTO
// ==============================

window.salvarMercadoPago = async function() {
  const dados = {
    mercadopago: {
    email: document.getElementById("mp-email").value,
    token: document.getElementById("mp-token").value,
    pix: document.getElementById("mp-pix").value
    }
  };
  await salvarConfiguracaoNuvem(dados);
};

window.salvarPagBank = async function() {
  const dados = {
    pagbank: {
    email: document.getElementById("pagbank-email").value.trim(),
    token: document.getElementById("pagbank-token").value.trim()
    }
  };
  await salvarConfiguracaoNuvem(dados);
};

window.salvarStripe = async function() {
  const dados = {
    stripe: {
    pub: document.getElementById("stripe-pub").value,
    secret: document.getElementById("stripe-secret").value,
    account: document.getElementById("stripe-account").value
    }
  };
  await salvarConfiguracaoNuvem(dados);
};

window.salvarPix = async function() {
  const dados = {
    pix: {
    chave: document.getElementById("pix-chave").value,
    nome: document.getElementById("pix-nome").value,
    descricao: document.getElementById("pix-descricao").value
    }
  };
  await salvarConfiguracaoNuvem(dados);
};

async function salvarConfiguracaoNuvem(dados) {
  try {
    await window.setDoc(window.doc(window.db, "configuracoes", "pagamentos"), dados, { merge: true });
    alert("✅ Configurações salvas na nuvem! Todos os usuários receberão a atualização.");
    carregarConfiguracoesPagamento();
  } catch (e) {
    alert("Erro ao salvar: " + e.message);
  }
}

async function carregarConfiguracoesPagamento() {
  try {
    await aguardarFirebase();
    const docSnap = await window.getDoc(window.doc(window.db, "configuracoes", "pagamentos"));
    
    if (docSnap.exists()) {
      const config = docSnap.data();
      
      if (config.mercadopago) {
        document.getElementById("mp-email").value = config.mercadopago.email || "";
        document.getElementById("mp-token").value = config.mercadopago.token || "";
        document.getElementById("mp-pix").value = config.mercadopago.pix || "";
      }
      
      if (config.pagbank) {
        const emailInput = document.getElementById("pagbank-email");
        const tokenInput = document.getElementById("pagbank-token");
        if (emailInput) emailInput.value = config.pagbank.email || "";
        if (tokenInput) tokenInput.value = config.pagbank.token || "";
      }

      if (config.stripe) {
        document.getElementById("stripe-pub").value = config.stripe.pub || "";
        document.getElementById("stripe-secret").value = config.stripe.secret || "";
        document.getElementById("stripe-account").value = config.stripe.account || "";
      }
      
      if (config.pix) {
        document.getElementById("pix-chave").value = config.pix.chave || "";
        document.getElementById("pix-nome").value = config.pix.nome || "";
        document.getElementById("pix-descricao").value = config.pix.descricao || "";
      }

      const lista = document.getElementById("contas-ativas");
      if (lista) {
        lista.innerHTML = "";
        if (config.mercadopago) lista.innerHTML += `<div class="conta-card"><strong>Mercado Pago</strong><p>${config.mercadopago.email}</p></div>`;
        if (config.pagbank) lista.innerHTML += `<div class="conta-card"><strong>PagBank</strong><p>${config.pagbank.email}</p></div>`;
        if (config.stripe) lista.innerHTML += `<div class="conta-card"><strong>Stripe</strong><p>${config.stripe.account}</p></div>`;
        if (config.pix) lista.innerHTML += `<div class="conta-card"><strong>PIX</strong><p>${config.pix.chave}</p></div>`;
        
        if (lista.innerHTML === "") lista.innerHTML = '<p class="vazio">Nenhuma conta configurada ainda</p>';
      }
    }
  } catch (e) {
    console.error("Erro ao carregar configs:", e);
  }
}

window.filtrarUsuarios = () => carregarUsuariosAdmin(document.getElementById("filtro-usuarios").value);

// ==============================
// TRANSAÇÕES GERAIS
// ==============================

window.filtrarTransacoes = async function() {
  const container = document.getElementById("lista-transacoes");
  if (!container) return;

  container.innerHTML = '<p class="vazio">Carregando...</p>';

  const tipoFiltro = document.getElementById("filtro-tipo").value;
  const dataFiltro = document.getElementById("filtro-data").value;

  try {
    await aguardarFirebase(); // Espera conexão
    const querySnapshot = await window.getDocs(window.collection(window.db, "transacoes"));
    const todas = [];
    querySnapshot.forEach((doc) => {
      todas.push(doc.data());
    });

    todas.sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = "";
    
    const filtradas = todas.filter(t => {
      if (tipoFiltro && t.tipo !== tipoFiltro) return false;
      if (dataFiltro && !t.data.includes(dataFiltro)) return false;
      return true;
    });

    if (filtradas.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhuma transação encontrada.</p>';
      return;
    }

    filtradas.forEach(t => {
      const div = document.createElement("div");
      div.className = "transacoes-admin";
      div.innerHTML = `
        <div class="trans-esquerda">
          <strong>${t.usuarioNome}</strong>
          <small>${t.usuarioEmail}</small>
          <small>ID: ${t.id}</small>
        </div>
        <div class="trans-centro">
          <span class="tipo">${t.tipo}</span>
          <span class="metodo">${t.metodo}</span>
        </div>
        <div class="trans-direita">
          <div class="valor">R$ ${t.valor.toFixed(2)}</div>
          <div class="status" style="color: ${t.status === 'Aprovado' ? '#64ff64' : t.status === 'Rejeitado' ? '#ff6b6b' : '#ffa500'}">${t.status}</div>
          <small>${t.data}</small>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error("Erro ao carregar transações:", e);
    container.innerHTML = '<p class="vazio">Erro ao carregar transações.</p>';
  }
};

// ==============================
// RELATÓRIOS E GRÁFICOS
// ==============================

window.salvarLimiteFundo = async function() {
  const novoLimite = parseFloat(document.getElementById("input-limite-fundo").value);
  if (isNaN(novoLimite) || novoLimite < 0) return alert("Valor inválido!");

  try {
    const financeiroRef = window.doc(window.db, "configuracoes", "financeiro");
    await window.setDoc(financeiroRef, { limiteFundoDeCaixa: novoLimite }, { merge: true });
    alert("✅ Limite do Fundo de Caixa atualizado!");
    carregarRelatoriosAdmin();
  } catch (e) {
    alert("Erro ao salvar: " + e.message);
  }
};

window.zerarFinanceiroCompleto = async function() {
  if (!confirm("⚠️ PERIGO: Você está prestes a ZERAR todo o histórico financeiro acumulado.\n\nIsso apagará:\n- Total Depositado\n- Total Sacado\n- Saldo do Fundo de Caixa\n- Saldo do Caixa Operacional\n\nDeseja continuar?")) {
    return;
  }

  if (!confirm("‼️ CONFIRMAÇÃO FINAL\n\nTem certeza absoluta que deseja zerar os caixas? Essa ação é irreversível.")) {
    return;
  }

  try {
    const financeiroRef = window.doc(window.db, "configuracoes", "financeiro");
    await window.updateDoc(financeiroRef, {
      fundoDeCaixaAtual: 0,
      caixaNormalAtual: 0,
      totalDepositosProcessados: 0,
      totalSaquesProcessados: 0
    });
    alert("✅ Financeiro zerado com sucesso!");
    carregarRelatoriosAdmin();
  } catch (e) {
    alert("Erro ao zerar: " + e.message);
  }
};

let chartInstance = null;

async function carregarRelatoriosAdmin() {
  try {
    await aguardarFirebase(); // Espera conexão

    // Garante que o documento de configuração financeira exista e inicializa se não
    const financeiroRef = window.doc(window.db, "configuracoes", "financeiro");
    const financeiroSnap = await window.getDoc(financeiroRef);
    let financeiroConfig = {
      fundoDeCaixaAtual: 0,
      caixaNormalAtual: 0,
      totalDepositosProcessados: 0,
      totalSaquesProcessados: 0,
      limiteFundoDeCaixa: 5000 // Armazena o limite também
    };

    if (financeiroSnap.exists()) {
      financeiroConfig = { ...financeiroConfig, ...financeiroSnap.data() };
    } else {
      await window.setDoc(financeiroRef, financeiroConfig); // Cria com valores padrão
    }

    // Atualiza input do limite
    const inputLimite = document.getElementById("input-limite-fundo");
    if (inputLimite) inputLimite.value = financeiroConfig.limiteFundoDeCaixa;

    const usuariosSnap = await window.getDocs(window.collection(window.db, "usuarios"));
    
    // Atualiza os cards de relatório com os dados financeiros do sistema
    document.getElementById("total-depositado").innerText = `R$ ${financeiroConfig.totalDepositosProcessados.toFixed(2)}`;
    document.getElementById("total-sacado").innerText = `R$ ${financeiroConfig.totalSaquesProcessados.toFixed(2)}`;
    
    // Novos campos para Fundo de Caixa e Caixa Normal
    const fundoCaixaEl = document.getElementById("fundo-caixa");
    if (fundoCaixaEl) fundoCaixaEl.innerText = `R$ ${financeiroConfig.fundoDeCaixaAtual.toFixed(2)}`;

    const caixaNormalEl = document.getElementById("caixa-normal");
    if (caixaNormalEl) caixaNormalEl.innerText = `R$ ${financeiroConfig.caixaNormalAtual.toFixed(2)}`;

    // Saldo Operacional é a soma do fundo de caixa e do caixa normal
    const saldoOperacional = financeiroConfig.fundoDeCaixaAtual + financeiroConfig.caixaNormalAtual;
    const saldoOperacionalEl = document.getElementById("saldo-operacional");
    if (saldoOperacionalEl) saldoOperacionalEl.innerText = `R$ ${saldoOperacional.toFixed(2)}`;

    // O elemento "saldo-caixa" original pode ser removido ou renomeado para "saldo-operacional"
    // document.getElementById("saldo-caixa").innerText = `R$ ${saldoCaixa.toFixed(2)}`; // Removido ou substituído
    document.getElementById("total-usuarios").innerText = usuariosSnap.size;

    renderizarGrafico(financeiroConfig.totalDepositosProcessados, financeiroConfig.totalSaquesProcessados);
  } catch (e) {
    console.error("Erro ao carregar relatórios:", e);
  }
}

function renderizarGrafico(depositos, saques) {
  const ctx = document.getElementById('graficoFinanceiro'); // Assuming this element exists in admin.html
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  } // This function was previously using `totalDepositos` and `totalSaques` from a local calculation.

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Depósitos', 'Saques'],
      datasets: [{
        label: 'Movimentação (R$)',
        data: [depositos, saques],
        backgroundColor: [
          'rgba(0, 255, 213, 0.5)',
          'rgba(255, 107, 107, 0.5)'
        ],
        borderColor: [
          '#00ffd5',
          '#ff6b6b'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#fff' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#fff' }
        }
      }
    }
  });
}

window.exportarRelatorioPDF = function() {
  if (!window.jspdf) {
    alert("Erro: Biblioteca PDF não carregada. Verifique sua conexão.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const primaryColor = [0, 255, 213];
  const secondaryColor = [15, 23, 42];

  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Portal do Bicho", 105, 20, null, null, "center");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Financeiro Administrativo", 105, 30, null, null, "center");

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 50);

  const depositado = document.getElementById("total-depositado").innerText;
  const sacado = document.getElementById("total-sacado").innerText;
  const fundo = document.getElementById("fundo-caixa") ? document.getElementById("fundo-caixa").innerText : "R$ 0,00";
  const caixaNormal = document.getElementById("caixa-normal") ? document.getElementById("caixa-normal").innerText : "R$ 0,00";
  const saldoOperacional = document.getElementById("saldo-operacional") ? document.getElementById("saldo-operacional").innerText : "R$ 0,00";
  const saldo = document.getElementById("saldo-caixa").innerText;
  const usuarios = document.getElementById("total-usuarios").innerText;

  let yPos = 65;
  
  const addDataLine = (label, value, y) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(label, 20, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(value, 80, y);
  };

  addDataLine("Total Depositado:", depositado, yPos);
  addDataLine("Total Sacado:", sacado, yPos + 10);
  addDataLine("Fundo de Caixa:", fundo, yPos + 20); // Novo
  addDataLine("Caixa Normal:", caixaNormal, yPos + 30); // Novo
  addDataLine("Saldo Operacional:", saldoOperacional, yPos + 40); // Atualizado para refletir a soma
  addDataLine("Usuários Cadastrados:", usuarios, yPos + 40);

  const canvas = document.getElementById('graficoFinanceiro');
  if (canvas) {
    const canvasImg = canvas.toDataURL("image/png");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Gráfico de Movimentação:", 20, yPos + 60);
    
    doc.setFillColor(...secondaryColor);
    doc.rect(15, yPos + 70, 180, 100, 'F');
    doc.addImage(canvasImg, 'PNG', 15, yPos + 70, 180, 100);
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Documento confidencial - Uso exclusivo da administração", 105, 290, null, null, "center");

  doc.save(`relatorio_financeiro_${Date.now()}.pdf`);
};

// ==============================
// AGENDADOR DE RELATÓRIO SEMANAL
// ==============================

let ultimoRelatorioAgendado = null; // Controla para não gerar o relatório várias vezes no mesmo dia

function iniciarAgendadorDeRelatorio() {
  console.log("⏰ Agendador de relatório semanal iniciado. Verificando a cada minuto.");

  setInterval(() => {
    const agora = new Date();
    const diaDaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado
    const hora = agora.getHours();
    const minuto = agora.getMinutes();
    const dataString = agora.toDateString(); // Ex: "Sat Apr 20 2024"

    // Condições: É Sábado, meio-dia (12:00), e o relatório ainda não foi oferecido hoje.
    if (diaDaSemana === 6 && hora === 12 && minuto === 0 && ultimoRelatorioAgendado !== dataString) {
      // Marca como "oferecido" para não repetir no mesmo minuto ou se a página for recarregada.
      ultimoRelatorioAgendado = dataString; 
      
      if (confirm("🗓️ É Sábado ao meio-dia. Deseja gerar e baixar o relatório financeiro semanal agora?")) {
        exportarRelatorioPDF();
        zerarCicloSemanal();
      }
    }
  }, 60000); // Verifica a cada 60 segundos (1 minuto)
}

async function zerarCicloSemanal() {
  try {
    const financeiroRef = window.doc(window.db, "configuracoes", "financeiro");
    // Zera apenas os acumuladores de fluxo (Total Depositado/Sacado), mantém os saldos de caixa (Fundo/Normal)
    await window.updateDoc(financeiroRef, { 
      totalDepositosProcessados: 0,
      totalSaquesProcessados: 0
    });
    alert("🔄 Ciclo semanal encerrado: Contadores de depósitos e saques foram reiniciados.");
    carregarRelatoriosAdmin(); // Atualiza a tela
  } catch (e) {
    console.error("Erro ao zerar ciclo semanal:", e);
  }
}
