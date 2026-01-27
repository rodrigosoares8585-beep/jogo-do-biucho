const cotações = {
  // CONFIGURAÇÃO DE COTAÇÕES (ATUALIZADA)
  // Estrutura: { seco: Valor na Cabeça, cercado: Valor 1º ao 5º }
  grupo: { seco: 20, cercado: 4 },
  dezena: { seco: 80, cercado: 16 },
  centena: { seco: 800, cercado: 80 },
  milhar: { seco: 8000, cercado: 1600 },
  
  // MODALIDADES ESPECIAIS
  duque_dezena: 300, // Seco
  terno_dezena: 10000, // Seco
  
  duque_grupo: { seco: 180, cercado: 18 }, // seco = 1º ao 2º, cercado = 1º ao 5º
  terno_grupo: 1500, // 1º ao 3º
  
  unidade: { seco: 1.80, cercado: 1.50 },
  passe_vai: 100, // 1º ao 5º
  passe_vai_vem: 45, // 1º ao 5º
  palpite_3: 8,
  milhar_brinde: 1000
};

const bichos = [
  { nome: "Avestruz", nums: [1,2,3,4], cotacao: 18.0 },
  { nome: "Águia", nums: [5,6,7,8], cotacao: 18.0 },
  { nome: "Burro", nums: [9,10,11,12], cotacao: 18.0 },
  { nome: "Borboleta", nums: [13,14,15,16], cotacao: 18.0 },
  { nome: "Cachorro", nums: [17,18,19,20], cotacao: 18.0 },
  { nome: "Cabra", nums: [21,22,23,24], cotacao: 18.0 },
  { nome: "Carneiro", nums: [25,26,27,28], cotacao: 18.0 },
  { nome: "Camelo", nums: [29,30,31,32], cotacao: 18.0 },
  { nome: "Cobra", nums: [33,34,35,36], cotacao: 18.0 },
  { nome: "Coelho", nums: [37,38,39,40], cotacao: 18.0 },
  { nome: "Cavalo", nums: [41,42,43,44], cotacao: 18.0 },
  { nome: "Elefante", nums: [45,46,47,48], cotacao: 18.0 },
  { nome: "Galo", nums: [49,50,51,52], cotacao: 18.0 },
  { nome: "Gato", nums: [53,54,55,56], cotacao: 18.0 },
  { nome: "Jacaré", nums: [57,58,59,60], cotacao: 18.0 },
  { nome: "Leão", nums: [61,62,63,64], cotacao: 18.0 },
  { nome: "Macaco", nums: [65,66,67,68], cotacao: 18.0 },
  { nome: "Porco", nums: [69,70,71,72], cotacao: 18.0 },
  { nome: "Pavão", nums: [73,74,75,76], cotacao: 18.0 },
  { nome: "Peru", nums: [77,78,79,80], cotacao: 18.0 },
  { nome: "Touro", nums: [81,82,83,84], cotacao: 18.0 },
  { nome: "Tigre", nums: [85,86,87,88], cotacao: 18.0 },
  { nome: "Urso", nums: [89,90,91,92], cotacao: 18.0 },
  { nome: "Veado", nums: [93,94,95,96], cotacao: 18.0 },
  { nome: "Vaca", nums: [97,98,99,0], cotacao: 18.0 }
];

const container = document.getElementById("bichos");

// ============================
// CONFIGURAÇÃO DE BANCAS E HORÁRIOS
// ============================
// Incluindo as bancas de Pernambuco solicitadas e outras comuns
const BANCAS = [
  // 1. BANCAS ESPECÍFICAS (Ordem importa: nomes compostos primeiro!)
  "Paratodos Bahia", "Paratodos PB", "Paratodos", 
  "Minas MG", "Minas Dia", "Minas Noite", "Minas",
  "Abaese", "Itabaiana", "Aval", "Bandeirantes", "Bicho RS", "Caminho da Sorte", 
  "Deu no Poste", "Aliança", "Federal", "Look", "Lotece", "Lotep", "Popular", 
  "Tradicional", "LBR", "Maluca", "Nordeste", 
  "PT-Rio", "PT Rio", "PT-SP", "PT SP", 
  "CL", "Preferida", "Salvation", "Corujinha", "Amnésia", "Ouro", "União", 
  "Adesp", "Global", "Local", "Águia", "Fênix", "Ponte", "Sorte", "Confiança",
  "Redenção", "Vila", "Capital", "Cotepe", "Potiguar", "Jangadeiro", "Seninha",
  "PTM", "PT", "PTV", "PTN", "COR"
];
const HORARIOS = ["12:45", "15:30", "18:30", "11:00", "14:00", "16:00", "18:00", "21:00", "Federal (Qua/Sab)"];

// Cache para armazenar resultados de diferentes bancas extraídos da página
let resultadosPorBanca = {}; 

function renderizarSeletores() {
  const div = document.createElement("div");
  div.className = "config-aposta-container";
  div.innerHTML = `
    <h3>⚙️ Configuração da Aposta</h3>
    <div class="form-grupo">
      <label for="select-banca" style="color:#fff; font-weight:600; margin-bottom:5px; display:block;">🏦 Escolha a Banca</label>
      <select id="select-banca" onchange="atualizarResultadoPorBancaSelecionada()" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); color:#fff;">
        <option value="">Selecione a Banca...</option>
        ${BANCAS.map(b => `<option value="${b}">${b}</option>`).join('')}
      </select>
    </div>
    <div class="form-grupo">
      <label for="select-horario" style="color:#fff; font-weight:600; margin-bottom:5px; display:block;">⏰ Escolha o Horário</label>
      <select id="select-horario" style="width:100%; padding:12px; border-radius:8px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); color:#fff;">
        <option value="">Selecione o Horário...</option>
        ${HORARIOS.map(h => `<option value="${h}">${h}</option>`).join('')}
      </select>
    </div>
  `;
  // Insere antes da grid de bichos
  if(container) {
    container.parentNode.insertBefore(div, container);
  }
}

function atualizarResultadoPorBancaSelecionada() {
  const bancaSelecionada = document.getElementById("select-banca").value;
  if (bancaSelecionada && resultadosPorBanca[bancaSelecionada]) {
    console.log(`Mostrando resultado armazenado para: ${bancaSelecionada}`);
    atualizarResultado(resultadosPorBanca[bancaSelecionada].valores);
    document.getElementById("badge-status").innerText = `● ${bancaSelecionada.toUpperCase()}`;
  }
}

// Renderiza os seletores ao iniciar
renderizarSeletores();

// Função utilitária para formatar moeda profissionalmente
const formatarBRL = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Função inteligente para carregar imagens (resolve cache e nomes 01.png vs 1.png)
window.tratarErroImagem = (img, nome, i) => {
  // Se falhou o carregamento normal (ex: 1.png), tenta com zero na frente (ex: 01.png)
  if (!img.dataset.tentouZero) {
    img.dataset.tentouZero = "true";
    img.src = `imagens/${String(i+1).padStart(2, '0')}.png?v=${Date.now()}`;
  } else {
    // Se falhou o zero também, coloca o placeholder colorido
    img.src = `https://placehold.co/200x200/243b55/00ffd5?text=${nome}`;
    img.onerror = null;
  }
};

// Renderiza os bichos
if (container) {
  bichos.forEach((b, i) => {
    const div = document.createElement("div");
    div.className = "bicho";
    div.dataset.index = i;
    div.style.animationDelay = `${i * 0.05}s`;

    div.innerHTML = `
      <img src="imagens/${i+1}.png?v=${Date.now()}" onerror="tratarErroImagem(this, '${b.nome}', ${i})" alt="${b.nome}">
      <strong>${b.nome}</strong>
      <span class="nums">${b.nums.map(n => String(n).padStart(2,"0")).join(" ")}</span>
      <div class="cotacao">
        <span class="label">Cotação:</span>
        <span class="valor">${cotações.grupo.seco.toFixed(2)}x</span>
      </div>
      <div class="aposta-container">
        <input type="number" class="valor-aposta" placeholder="R$ 0,00" step="0.01" min="0">
        <div class="opcao-cercado">
          <label style="cursor:pointer; display:flex; align-items:center; gap:5px;"><input type="checkbox" class="check-cercado"> 1º ao 5º (Cercado)</label>
        </div>
        <button class="btn-apostar" onclick="fazerAposta(${i})">Apostar</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ============================
// FUNÇÕES DE APOSTA
// ============================

function fazerAposta(indexBicho) {
  const usuario = obterUsuario();
  if (!usuario) {
    alert("Você precisa estar logado para apostar!");
    return;
  }

  // VALIDAÇÃO DE BANCA E HORÁRIO
  const banca = document.getElementById("select-banca").value;
  const horario = document.getElementById("select-horario").value;

  if (!banca || !horario) {
    alert("⚠️ Por favor, selecione a BANCA e o HORÁRIO no topo da página antes de apostar!");
    document.querySelector(".config-aposta-container").scrollIntoView({behavior: "smooth"});
    return;
  }

  const bicho = bichos[indexBicho];
  const inputAposta = document.querySelectorAll(".valor-aposta")[indexBicho];
  const valorAposta = parseFloat(inputAposta.value);
  const checkboxCercado = document.querySelectorAll(".check-cercado")[indexBicho];
  const isCercado = checkboxCercado.checked;

  if (!valorAposta || valorAposta <= 0) {
    alert("Digite um valor válido!");
    return;
  }

  if (valorAposta > usuario.saldo) {
    alert(`Saldo insuficiente! Seu saldo: ${formatarBRL(usuario.saldo)}`);
    return;
  }

  // ADICIONAR AO CARRINHO (Não desconta saldo ainda)
  adicionarAoCarrinho({
    tipo: 'grupo',
    bichoIndex: indexBicho,
    nomeBicho: bicho.nome,
    valor: valorAposta,
    cotacao: cotações.grupo,
    modalidade: isCercado ? '1ao5' : 'seco',
    banca: banca,
    horario: horario
  });

  inputAposta.value = "";
  checkboxCercado.checked = false;
}

function toggleCamposNumericos() {
  const tipo = document.getElementById("tipo-aposta-numerica").value;
  const campoUnico = document.getElementById("numero-aposta");
  const campoMultiplo = document.getElementById("numeros-multiplos");
  
  if (['duque_dezena', 'terno_dezena', 'duque_grupo', 'terno_grupo'].includes(tipo)) {
    campoUnico.style.display = "none";
    campoMultiplo.style.display = "block";
    
    if (tipo.includes('grupo')) {
        campoMultiplo.placeholder = "Ex: 15, 20 (Grupos 1-25)";
    } else {
        campoMultiplo.placeholder = "Ex: 12, 45 (Dezenas 00-99)";
    }
  } else {
    campoUnico.style.display = "block";
    campoMultiplo.style.display = "none";
    
    if (tipo === 'grupo') {
        campoUnico.placeholder = "Digite o Grupo (1-25)";
        campoUnico.maxLength = 2;
    } else if (tipo === 'dezena') {
        campoUnico.placeholder = "Digite a Dezena (00-99)";
        campoUnico.maxLength = 2;
    } else if (tipo === 'centena') {
        campoUnico.placeholder = "Digite a Centena (000-999)";
        campoUnico.maxLength = 3;
    } else {
        campoUnico.placeholder = "Digite a Milhar (0000-9999)";
        campoUnico.maxLength = 4;
    }
  }
}

function fazerApostaNumerica() {
  const usuario = obterUsuario();
  if (!usuario) {
    alert("Você precisa estar logado para apostar!");
    return;
  }

  // VALIDAÇÃO DE BANCA E HORÁRIO
  const banca = document.getElementById("select-banca").value;
  const horario = document.getElementById("select-horario").value;

  if (!banca || !horario) {
    alert("⚠️ Por favor, selecione a BANCA e o HORÁRIO no topo da página antes de apostar!");
    document.querySelector(".config-aposta-container").scrollIntoView({behavior: "smooth"});
    return;
  }

  const tipo = document.getElementById("tipo-aposta-numerica").value;
  const inputValor = document.getElementById("valor-aposta-numerica");
  const valorAposta = parseFloat(inputValor.value);
  
  // Tenta pegar checkbox de cercado numérico (caso o usuário adicione no HTML futuramente)
  const inputCercado = document.getElementById("cercado-aposta-numerica");
  const isCercado = inputCercado ? inputCercado.checked : false;

  // Validações
  if (!valorAposta || valorAposta <= 0) {
    alert("Digite um valor de aposta válido!");
    return;
  }

  if (valorAposta > usuario.saldo) {
    alert(`Saldo insuficiente! Seu saldo: ${formatarBRL(usuario.saldo)}`);
    return;
  }

  let numeroApostado;
  
  // Lógica para múltiplos números vs único
  if (['duque_dezena', 'terno_dezena', 'duque_grupo', 'terno_grupo'].includes(tipo)) {
      const inputMultiplo = document.getElementById("numeros-multiplos");
      numeroApostado = inputMultiplo.value;
      
      // Validação de múltiplos (permite espaços após vírgula)
      if (!/^(\d{1,2}\s*(,\s*\d{1,2})*)$/.test(numeroApostado)) {
          alert("Formato inválido! Use números separados por vírgula. Ex: 12, 45");
          return;
      }
      
      const nums = numeroApostado.split(',').map(n => n.trim());
      const qtdEsperada = tipo.includes('duque') ? 2 : 3;
      
      if (nums.length !== qtdEsperada) {
          alert(`Para ${tipo.replace('_', ' de ')}, você deve digitar exatamente ${qtdEsperada} números.`);
          return;
      }
      
  } else {
      const inputUnico = document.getElementById("numero-aposta");
      numeroApostado = inputUnico.value;
      
      if (!/^\d+$/.test(numeroApostado)) {
        alert("Digite apenas números!");
        return;
      }

      const comprimentos = { grupo: 2, dezena: 2, centena: 3, milhar: 4 };
      // Validação de comprimento (exceto grupo que pode ser 1 ou 2 digitos, mas maxLength cuida disso)
      if (tipo !== 'grupo' && numeroApostado.length !== comprimentos[tipo]) {
        alert(`Para aposta de ${tipo}, você deve digitar um número com ${comprimentos[tipo]} dígitos.`);
        return;
      }
      
      if (tipo === 'grupo') {
          const g = parseInt(numeroApostado);
          if (g < 1 || g > 25) {
              alert("Grupo deve ser entre 1 e 25.");
              return;
          }
      }
  }

  // ADICIONAR AO CARRINHO
  adicionarAoCarrinho({
    tipo: tipo,
    numero: numeroApostado,
    valor: valorAposta,
    cotacao: cotações[tipo] || 0,
    modalidade: isCercado ? '1ao5' : 'seco',
    banca: banca,
    horario: horario
  });

  // Limpar campos
  document.getElementById("numero-aposta").value = "";
  document.getElementById("numeros-multiplos").value = "";
  inputValor.value = "";
}

// ============================
// LÓGICA DO BOLETIM (CARRINHO)
// ============================

function adicionarAoCarrinho(aposta) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push(aposta);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  
  atualizarBoletim();
  abrirBoletim(); // Abre o boletim automaticamente para mostrar a aposta
}

function atualizarBoletim() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const container = document.getElementById("itens-carrinho");
  const qtdEl = document.getElementById("qtd-carrinho");
  const totalEl = document.getElementById("total-carrinho");
  const ganhoEl = document.getElementById("ganho-carrinho");

  if (qtdEl) qtdEl.innerText = carrinho.length;

  if (carrinho.length === 0) {
    if (container) container.innerHTML = '<p style="text-align:center; opacity:0.6; font-size:12px;">Nenhuma aposta selecionada</p>';
    if (totalEl) totalEl.innerText = formatarBRL(0);
    if (ganhoEl) ganhoEl.innerText = formatarBRL(0);
    return;
  }

  let totalApostado = 0;
  let ganhoPotencial = 0;

  if (container) {
  container.innerHTML = carrinho.map((item, index) => {
    totalApostado += item.valor;
    
    // Cálculo de ganho potencial para exibição (Usa o maior valor possível - Cabeça)
    let cotacaoDisplay = 0;
    if (typeof item.cotacao === 'object') {
      cotacaoDisplay = item.cotacao.seco;
    } else {
      cotacaoDisplay = item.cotacao;
    }
    ganhoPotencial += (item.valor * cotacaoDisplay);

    let descricao = item.tipo === 'grupo' ? `Grupo: ${item.nomeBicho}` : `${item.tipo.toUpperCase()}: ${item.numero}`;
    // Adiciona info da modalidade
    descricao += item.modalidade === '1ao5' ? " (1º ao 5º)" : " (Seco)";
    const infoExtra = `<div style="font-size:11px; color:#94a3b8; margin-top:2px;">${item.banca} • ${item.horario}</div>`;

    return `
      <div class="item-carrinho">
        <div class="item-info">
          <strong>${descricao}</strong>
          ${infoExtra}
          <span>Valor: ${formatarBRL(item.valor)}</span>
        </div>
        <button class="btn-remover-item" onclick="removerDoCarrinho(${index})">🗑️</button>
      </div>
    `;
  }).join("");
  }

  if (totalEl) totalEl.innerText = formatarBRL(totalApostado);
  if (ganhoEl) ganhoEl.innerText = formatarBRL(ganhoPotencial);
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarBoletim();
}

async function confirmarBoletim() {
  const usuario = obterUsuario();
  if (!usuario) return alert("Faça login!");

  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  if (carrinho.length === 0) return alert("Selecione pelo menos uma aposta!");

  const totalApostado = carrinho.reduce((acc, item) => acc + item.valor, 0);

  if (totalApostado > usuario.saldo) {
    return alert(`Saldo insuficiente para confirmar essas apostas!\nTotal: ${formatarBRL(totalApostado)}\nSeu Saldo: ${formatarBRL(usuario.saldo)}`);
  }

  // 1. Deduzir saldo total e atualizar na Nuvem
  const novoSaldo = usuario.saldo - totalApostado;
  
  try {
    // Atualiza saldo no Firebase
    await window.updateDoc(window.doc(window.db, "usuarios", usuario.id), { saldo: novoSaldo });
    atualizarSaldo(novoSaldo); // Atualiza visualmente

    // 2. Salvar Apostas na Nuvem (Firestore)
    const batchPromises = carrinho.map(item => {
      const aposta = {
        ...item,
        id: 'BET-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
        userId: usuario.id,
        usuarioNome: usuario.nome,
        dataAposta: new Date().toLocaleString(),
        timestamp: Date.now(),
        status: 'Pendente'
      };
      return window.setDoc(window.doc(window.db, "apostas", aposta.id), aposta);
    });

    await Promise.all(batchPromises);

    // 3. Limpar carrinho
    localStorage.removeItem("carrinho");
    atualizarBoletim();
    toggleBoletim(); // Fecha o boletim

    atualizarListaBilhetes();
    alert(`✅ Apostas realizadas e salvas na nuvem!`);

  } catch (e) {
    console.error("Erro ao salvar aposta:", e);
    alert("Erro ao processar aposta. Verifique sua conexão.");
  }
}

function toggleBoletim() {
  document.getElementById("boletim").classList.toggle("aberto");
  const seta = document.getElementById("seta-boletim");
  seta.style.transform = document.getElementById("boletim").classList.contains("aberto") ? "rotate(180deg)" : "rotate(0deg)";
}

function abrirBoletim() {
  document.getElementById("boletim").classList.add("aberto");
}

// ============================
// RESULTADO EXTERNO (SIMULADO)
// ============================
// Aqui futuramente entra:
// fetch("SEU_BACKEND/api/resultado")

function atualizarResultado(premios) {
  const container = document.getElementById("lista-premios");
  if (!container) return; // Proteção se não estiver na home
  container.innerHTML = "";

  premios.forEach((num, index) => {
    const posicao = index + 1;
    const destaqueClass = posicao === 1 ? "destaque" : "";
    
    container.innerHTML += `
      <div class="premio-card ${destaqueClass}">
        <span class="premio-posicao">${posicao}º Prêmio</span>
        <span class="premio-numero">${String(num).padStart(4, '0')}</span>
      </div>
    `;
  });

  // Usa o 1º prêmio para destacar o bicho no tabuleiro
  const primeiroPremio = premios[0];

  document.querySelectorAll(".bicho").forEach(div => {
    div.classList.remove("vencedor");
  });

  const dezenaSorteada = primeiroPremio % 100;

  bichos.forEach((b, i) => {
    if (b.nums.includes(dezenaSorteada)) {
      document.querySelector(`[data-index="${i}"]`)
        .classList.add("vencedor");
    }
  });
}

// ============================
// SISTEMA DE SORTEIO AUTOMÁTICO
// ============================

let tempoRestante = 15; // Segundos para o próximo sorteio
const divResultado = document.getElementById("resultado");

let ultimoResultado = null; // Armazena o resultado atual para conferência imediata

// Adicionar visualização do Timer
const timerDisplay = document.createElement("div");
timerDisplay.style.marginTop = "10px";
timerDisplay.style.fontSize = "14px";
timerDisplay.style.color = "#ffd166";
timerDisplay.style.fontWeight = "bold";
// divResultado.appendChild(timerDisplay); // Cronômetro oculto

let intervaloTimer = null; // Controle do timer

async function realizarSorteio() {
  // Pausa o timer e mostra status de extração
  clearInterval(intervaloTimer);
  timerDisplay.innerText = "🔄 Sincronizando Resultados...";
  timerDisplay.style.color = "#00ffd5";
  
  let resultado;

  try {
    // Busca o resultado (Apenas Lotece)
    resultado = await buscarResultadoLoteriaSonho();
  } catch (erro) {
    console.warn("Aguardando resultado da Lotece...", erro);
    timerDisplay.innerText = "⚠️ Buscando...";
    timerDisplay.style.color = "#ff6b6b";
    
    // Se falhar, tenta novamente em 10 segundos
    tempoRestante = 10;
    iniciarTimer();
    return;
  }
  
  // Atualiza Badge de Status
  const badge = document.getElementById("badge-status");
  if (badge) badge.style.display = "inline-block";
  
  // Identifica o nome do site de onde veio o resultado
  let nomeFonte = resultado.bancaDetectada || "LOTECE";
  if (resultado.fonte) {
    try {
      // Se não detectou banca específica, usa o domínio
      if (!resultado.bancaDetectada) nomeFonte = new URL(resultado.fonte).hostname.replace("www.", "").split(".")[0].toUpperCase();
    } catch (e) { }
  }

  const horarioTexto = resultado.horario ? ` ${resultado.horario}` : "";
  if (badge) {
    badge.innerText = `● ${nomeFonte}${horarioTexto.toUpperCase()}`;
    badge.title = `Fonte: ${resultado.fonte}`; // Mostra o link completo ao passar o mouse
    badge.style.backgroundColor = "rgba(0, 255, 136, 0.2)";
    badge.style.color = "#00ff88";
    badge.style.border = "1px solid #00ff88";
  }

  // VERIFICAÇÃO DE MUDANÇA (Só atualiza se for um novo sorteio)
  const novoResultadoStr = JSON.stringify(resultado.valores);
  const ultimoResultadoStr = ultimoResultado ? JSON.stringify(ultimoResultado) : "";

  if (ultimoResultado && novoResultadoStr === ultimoResultadoStr) {
    console.log("Resultado inalterado. Aguardando atualização da Lotece...");
    // Não faz nada, apenas reinicia o timer para checar depois
    tempoRestante = 30; // Checa a cada 30s
    timerDisplay.style.color = "#ffd166";
    iniciarTimer();
    return;
  }

  // SE MUDOU (OU É O PRIMEIRO LOAD):
  console.log("Novo sorteio detectado!");

  // Atualiza a tela
  atualizarResultado(resultado.valores);
  ultimoResultado = resultado.valores; // Atualiza a variável global
  
  // Verifica ganhadores com o NOVO resultado
  verificarApostas(resultado); // Agora é async, mas não precisamos esperar o await aqui para não travar a UI

  // Atualiza histórico visual
  atualizarHistorico(resultado);

  // Renderiza a grade com todas as bancas encontradas separadamente
  renderizarGradeResultados();

  // Reinicia o ciclo
  tempoRestante = 30; // Aguarda 30s para próxima verificação
  timerDisplay.style.color = "#ffd166";
  iniciarTimer();
}

async function verificarApostas(resultadoObj) {
  const usuario = obterUsuario();
  if (!usuario) return;

  // Busca apostas pendentes DO FIREBASE
  let pendentes = [];
  try {
    const q = window.query(
      window.collection(window.db, "apostas"),
      window.where("userId", "==", usuario.id),
      window.where("status", "==", "Pendente")
    );
    const snapshot = await window.getDocs(q);
    snapshot.forEach(doc => pendentes.push(doc.data()));
  } catch (e) {
    console.error("Erro ao buscar apostas:", e);
    return;
  }

  if (pendentes.length === 0) return;

  const todosPremios = resultadoObj.valores;
  let totalGanho = 0;
  let mensagensVitoria = [];
  let updates = [];

  // Processa cada aposta
  pendentes.forEach(aposta => {
    // Tenta verificar se a banca e horário batem (se a informação estiver disponível)
    // Se o resultado veio com bancaDetectada, usamos para validar "Perdeu".
    // Se não bater a banca, ignoramos (continua Pendente).
    // Se bater a banca e não ganhar, marca como Perdeu.
    
    const bancaSorteio = resultadoObj.bancaDetectada || "";
    const horarioSorteio = resultadoObj.horario || "";
    
    // Normalização simples para comparação
    const bancaApostaNorm = aposta.banca.toLowerCase().trim();
    const bancaSorteioNorm = bancaSorteio.toLowerCase().trim();
    
    // Se as bancas forem muito diferentes, pula (não valida nem ganho nem perda)
    // Nota: Isso é uma proteção básica. Se o nome for idêntico ou contido, prossegue.
    const mesmaBanca = bancaSorteioNorm.includes(bancaApostaNorm) || bancaApostaNorm.includes(bancaSorteioNorm);
    
    // Se não for a mesma banca, não faz nada (continua pendente esperando a banca certa)
    if (!mesmaBanca && bancaSorteio !== "") return;

    let ganho = 0;
    let ganhouAposta = false;
    
    // ====================================================
    // 1. LÓGICA BANCA COMPLETA (Duque/Terno de Dezena e Grupo)
    // ====================================================
    if (['duque_dezena', 'terno_dezena', 'duque_grupo', 'terno_grupo'].includes(aposta.tipo)) {
      let acertou = false;
      let multiplicador = 0;

      if (aposta.tipo.includes('dezena')) {
        // Coleta todas as dezenas sorteadas nos 5 prêmios
        const dezenasSorteadas = todosPremios.map(p => String(p).padStart(4, '0').slice(-2));
        // Separa os números apostados (ex: "12,45")
        const numerosApostados = aposta.numero.split(',').map(n => n.trim());
        
        // Verifica se TODAS as dezenas apostadas estão nas sorteadas
        acertou = numerosApostados.every(n => dezenasSorteadas.includes(n));
        multiplicador = aposta.cotacao;
      } 
      else if (aposta.tipo.includes('grupo')) {
        const isCercado = aposta.modalidade === '1ao5';
        
        // Define limite de prêmios (indices)
        let limite = 4; // Default 1º ao 5º
        if (aposta.tipo === 'duque_grupo') {
           limite = isCercado ? 4 : 1; // Índices 0-4 ou 0-1 (1º ao 2º)
        } else if (aposta.tipo === 'terno_grupo') {
           limite = 2; // Índices 0-2 (1º ao 3º)
        }
        
        // Extrai grupos sorteados no range
        const gruposSorteados = todosPremios.slice(0, limite + 1).map(p => {
           const dezena = p % 100;
           return dezena === 0 ? 25 : Math.ceil(dezena / 4);
        });
        
        const gruposApostados = aposta.numero.split(',').map(n => parseInt(n.trim()));
        
        // Verifica acerto
        acertou = gruposApostados.every(g => gruposSorteados.includes(g));
        
        // Define cotação
        if (typeof aposta.cotacao === 'object') {
           multiplicador = isCercado ? aposta.cotacao.cercado : aposta.cotacao.seco;
        } else {
           multiplicador = aposta.cotacao;
        }
      }
      
      if (acertou) {
        ganho = aposta.valor * multiplicador;
        ganhouAposta = true;
        mensagensVitoria.push(`${aposta.tipo.toUpperCase().replace('_', ' ')}: ${aposta.numero} - ${formatarBRL(ganho)}`);
      }
    } 
    // ====================================================
    // 2. LÓGICA BANCA POPULAR (Grupo, Dezena, Centena, Milhar)
    // ====================================================
    else {
      const isCercado = aposta.modalidade === '1ao5';
      
      todosPremios.forEach((numeroSorteado, posicao) => {
        if (numeroSorteado === undefined) return;

        // Se for aposta SECA, ignora posições que não sejam a 1ª (índice 0)
        if (!isCercado && posicao > 0) return;

        const numeroSorteadoStr = String(numeroSorteado).padStart(4, '0');
        const milharSorteada = numeroSorteadoStr;
        const centenaSorteada = numeroSorteadoStr.slice(-3);
        const dezenaSorteada = numeroSorteadoStr.slice(-2);
        const grupoSorteadoNum = numeroSorteado % 100;
        
        let acertou = false;
        let descricaoPremio = "";

        switch (aposta.tipo) {
          case 'grupo':
            const bichoApostado = bichos[aposta.bichoIndex];
            if (bichoApostado.nums.includes(grupoSorteadoNum)) {
              acertou = true;
              descricaoPremio = `Grupo ${bichoApostado.nome}`;
            }
            break;
          case 'dezena':
            if (aposta.numero === dezenaSorteada) {
              acertou = true;
              descricaoPremio = `Dezena ${aposta.numero}`;
            }
            break;
          case 'centena':
            if (aposta.numero === centenaSorteada) {
              acertou = true;
              descricaoPremio = `Centena ${aposta.numero}`;
            }
            break;
          case 'milhar':
            if (aposta.numero === milharSorteada) {
              acertou = true;
              descricaoPremio = `Milhar ${aposta.numero}`;
            }
            break;
        }

        if (acertou) {
          // Define o multiplicador: Se for cercado usa valor cercado, se for seco usa valor seco
          const multiplicador = isCercado ? aposta.cotacao.cercado : aposta.cotacao.seco;
          const valorPremio = aposta.valor * multiplicador;
          
          ganho += valorPremio;
          ganhouAposta = true;
          const posicaoTexto = (posicao === 0) ? "Na Cabeça" : `${posicao + 1}º Prêmio`;
          mensagensVitoria.push(`${descricaoPremio} (${posicaoTexto}): ${formatarBRL(valorPremio)}`);
        }
      });
    }

    if (ganhouAposta) {
      aposta.status = 'Ganhou';
      totalGanho += ganho;
      updates.push(window.updateDoc(window.doc(window.db, "apostas", aposta.id), { status: 'Ganhou' }));
    } else if (mesmaBanca) {
      // Se era a mesma banca e não ganhou, então perdeu
      aposta.status = 'Perdeu';
      updates.push(window.updateDoc(window.doc(window.db, "apostas", aposta.id), { status: 'Perdeu' }));
    }
    // Se não era a mesma banca, continua 'Pendente'

    totalGanho += ganho;
  });

  if (updates.length > 0) {
    await Promise.all(updates);
    atualizarListaBilhetes();
  }

  if (totalGanho > 0) {
    try {
      // Atualiza saldo no Firebase (pega o mais recente para evitar conflito)
      const userRef = window.doc(window.db, "usuarios", usuario.id);
      const userSnap = await window.getDoc(userRef);
      const saldoAtual = userSnap.exists() ? userSnap.data().saldo : usuario.saldo;
      const novoSaldo = saldoAtual + totalGanho;
      
      await window.updateDoc(userRef, { saldo: novoSaldo });
      atualizarSaldo(novoSaldo);

      // REGISTRAR PRÊMIO NO FIREBASE (PARA O ADMIN VER)
      if (window.db && window.setDoc && window.doc) {
        const idTransacao = "WIN" + Date.now();
        const transacaoPremio = {
          id: idTransacao,
          userId: usuario.id,
          usuarioNome: usuario.nome,
          usuarioEmail: usuario.email,
          tipo: "Prêmio",
          valor: totalGanho,
          metodo: "Saldo",
          status: "Pago",
          data: new Date().toLocaleString("pt-BR"),
          timestamp: Date.now(),
          detalhes: mensagensVitoria.join(", ")
        };
        window.setDoc(window.doc(window.db, "transacoes", idTransacao), transacaoPremio)
          .catch(e => console.error("Erro ao salvar prêmio:", e));
      }

      setTimeout(() => {
        alert(`🎉 Parabéns! Você ganhou!\n\nPrêmios:\n- ${mensagensVitoria.join("\n- ")}\n\nTotal: ${formatarBRL(totalGanho)}`);
      }, 500);
    } catch(e) { console.error("Erro ao creditar prêmio:", e); }
  }
}

function renderizarGradeResultados() {
  let container = document.getElementById("grade-bancas");
  
  // Cria o container se não existir
  if (!container) {
    container = document.createElement("div");
    container.id = "grade-bancas";
    container.className = "grade-bancas";
    // Insere logo após o resultado principal
    const mainResult = document.getElementById("resultado");
    if (mainResult) mainResult.parentNode.insertBefore(container, mainResult.nextSibling);
  }

  container.innerHTML = Object.keys(resultadosPorBanca).map(banca => {
    const dados = resultadosPorBanca[banca];
    return `
      <div class="card-banca-mini">
        <h4>${banca}</h4>
        <div class="numeros-lista">
          ${dados.valores.map((n, i) => `
            <div class="linha-result">
              <span>${i + 1}º</span>
              <strong>${String(n).padStart(4, '0')}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Função Principal: Busca o primeiro resultado rápido e dispara o resto em background
async function buscarResultadoLoteriaSonho() {
  const fontes = [
    // LINKS DIRETOS POR BANCA (Extração Precisa)
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-abaese-itabaiana-paratodos',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-aval-pernambuco',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-bandeirantes-sp',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-bicho-rs',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-caminho-da-sorte',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-deu-no-poste',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-extracao-online-alianca',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-federal-do-brasil',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-look-loterias',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-lotece-loteria-dos-sonhos',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-lotep',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-loteria-popular',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-loteria-tradicional',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-loterias-br-lbr',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-maluca-bahia',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-minas-mg',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-nordeste-montes-claros',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-paratodos-bahia',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-paratodos-pb',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-pt-rio',
    'https://bancasdobicho.com.br/resultados-jogo-do-bicho-pt-sp'
  ];

  // Configuração de proxies para contornar bloqueios (CORS)
  const proxies = [
    {
      // Corsproxy.io (Geralmente o mais rápido e compatível)
      getUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url + '?t=' + Date.now())}`,
      extract: async (res) => await res.text()
    },
    {
      // CodeTabs (Backup robusto para HTML)
      getUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      extract: async (res) => await res.text()
    },
    {
      // AllOrigins (JSON - evita problemas de encoding)
      getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`,
      extract: async (res) => (await res.json()).contents
    },
    {
      // ThingProxy (Backup extra)
      getUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
      extract: async (res) => await res.text()
    }
  ];

  // Limpa o cache de bancas antes de começar uma nova busca completa
  resultadosPorBanca = {};

  // Tenta encontrar o resultado principal o mais rápido possível
  for (let i = 0; i < fontes.length; i++) {
    const url = fontes[i];
    // Processa a fonte atual
    const resultado = await processarFonte(url, proxies);
    
    if (resultado) {
      // SUCESSO! Retorna este resultado imediatamente para a tela principal
      
      // Mas antes, dispara a busca nas outras fontes em BACKGROUND (sem await)
      // para preencher a grade de bancas aos poucos
      const fontesRestantes = fontes.slice(i + 1);
      buscarBancasRestantes(fontesRestantes, proxies);
      
      return resultado;
    }
  }
  
  throw new Error("Não foi possível extrair de nenhuma fonte");
}

// Função que roda em segundo plano para preencher a grade
async function buscarBancasRestantes(fontes, proxies) {
  console.log("🔄 Buscando outras bancas em segundo plano...");
  for (const url of fontes) {
    // Processa e se achar algo novo, atualiza a grade visualmente
    const achou = await processarFonte(url, proxies);
    if (achou) {
      renderizarGradeResultados();
    }
  }
  console.log("✅ Busca de background finalizada.");
}

// Função auxiliar para garantir o nome correto da banca baseado no link
function obterNomeBancaPelaUrl(url) {
  if (url.includes("abaese")) return "Abaese";
  if (url.includes("aval")) return "Aval";
  if (url.includes("bandeirantes")) return "Bandeirantes";
  if (url.includes("bicho-rs")) return "Bicho RS";
  if (url.includes("caminho")) return "Caminho da Sorte";
  if (url.includes("deu-no-poste")) return "Deu no Poste";
  if (url.includes("alianca")) return "Aliança";
  if (url.includes("federal")) return "Federal";
  if (url.includes("look")) return "Look";
  if (url.includes("lotece")) return "Lotece";
  if (url.includes("lotep")) return "Lotep";
  if (url.includes("popular")) return "Popular";
  if (url.includes("tradicional")) return "Tradicional";
  if (url.includes("lbr")) return "LBR";
  if (url.includes("maluca")) return "Maluca";
  if (url.includes("minas")) return "Minas";
  if (url.includes("nordeste")) return "Nordeste";
  if (url.includes("paratodos-bahia")) return "Paratodos Bahia";
  if (url.includes("paratodos-pb")) return "Paratodos PB";
  if (url.includes("pt-rio")) return "PT Rio";
  if (url.includes("pt-sp")) return "PT SP";
  return "Outra Banca";
}

// Função auxiliar que processa UMA única URL
async function processarFonte(url, proxies) {
  const anoAtual = new Date().getFullYear();

  for (const proxy of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(proxy.getUrl(url), { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const htmlContent = await proxy.extract(response);
        if (!htmlContent) continue;

        // Verificar se foi bloqueado por Cloudflare/Captcha
        if (htmlContent.includes("Attention Required! | Cloudflare") || htmlContent.includes("Just a moment...")) {
          console.warn(`Bloqueado por Cloudflare em ${url}`);
          continue;
        }

        // ============================================================
        // PARSER AVANÇADO PARA MÚLTIPLAS BANCAS (PERNAMBUCO/OUTRAS)
        // ============================================================
        // Tenta identificar seções de bancas específicas (ex: Aval, Caminho da Sorte)
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Procura por títulos que contenham nomes das bancas conhecidas
        const titulos = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b, td, th, .titulo, .banca, span');
        // Tenta identificar pelo HTML, se falhar, usa o nome do link
        let bancaDestaUrl = obterNomeBancaPelaUrl(url);

        for (let titulo of titulos) {
          const textoTitulo = (titulo.textContent || "").trim();
          
          // Verifica se o título corresponde a uma das nossas bancas
          const bancaEncontrada = BANCAS.find(b => textoTitulo.toLowerCase().includes(b.toLowerCase()));
          
          if (bancaEncontrada) {
            // Evita falsos positivos em textos muito longos (ex: parágrafos explicativos)
            if (textoTitulo.length > 50) continue;

            // Encontrou um título de banca. Tenta achar a tabela/lista IMEDIATAMENTE após este título
            // Procura nos próximos irmãos (aumentado alcance para pular datas/ads)
            let containerBusca = titulo.nextElementSibling;
            let numerosBanca = [];
            let tentativas = 0;
            
            // Tenta extrair números dos elementos seguintes (tabela ou lista)
            while (containerBusca && tentativas < 20) {
              const textoContainer = containerBusca.innerText || containerBusca.textContent || "";
              
              // Pula containers muito pequenos ou vazios (provavelmente separadores)
              if (textoContainer.length < 3) { containerBusca = containerBusca.nextElementSibling; tentativas++; continue; }

              // Procura sequências de 4 dígitos
              const matches = textoContainer.match(/\b\d{4}\b/g);
              if (matches) {
                const validos = matches.map(n => parseInt(n)).filter(n => n < 2023 || n > 2026);
                for (const num of validos) {
                   if (numerosBanca.length < 5) numerosBanca.push(num);
                }
                
                if (numerosBanca.length >= 5) {
                  resultadosPorBanca[bancaEncontrada] = { valores: numerosBanca, horario: "Hoje" };
                  bancaDestaUrl = bancaEncontrada; // Atualiza com o nome exato achado no HTML se possível
                  break; // Achou, para de procurar
                }
              }
              containerBusca = containerBusca.nextElementSibling;
              tentativas++;
            }
          }
        }

        const premiosEncontrados = [];

        // Tenta extrair o horário do sorteio (ex: 14:00, 19h)
        let horarioDetectado = "";
        const regexHorario = /(\d{1,2}:\d{2})|(\d{1,2}\s*[hH])/;
        
        // 1. Procura em títulos/destaques
        const elementosTexto = doc.querySelectorAll('h1, h2, h3, strong, b, .titulo, .data');
        for (let el of elementosTexto) {
          const texto = el.textContent || el.innerText || "";
          const match = texto.match(regexHorario);
          if (match) {
            horarioDetectado = match[0].replace(/\s/g, '').toLowerCase();
            break;
          }
        }
        // 2. Fallback: Procura no corpo
        if (!horarioDetectado) {
           const bodyText = doc.body.textContent || doc.body.innerText || "";
           const matchBody = bodyText.match(regexHorario);
           if (matchBody) horarioDetectado = matchBody[0].replace(/\s/g, '').toLowerCase();
        }

        // ESTRATÉGIA 1: Busca por classes específicas (.premio e .numeros)
        // Baseado na estrutura: <li> <div class="premio">1° PRÊMIO</div> <div class="numeros">5354</div> </li>
        const itensComClasses = doc.querySelectorAll('li, div.resultado-item, tr');
        for (let item of itensComClasses) {
          const elPremio = item.querySelector('.premio, .posicao, .position');
          const elNumero = item.querySelector('.numeros, .resultado, .number');
          
          if (elPremio && elNumero) {
            const txtPremio = (elPremio.textContent || elPremio.innerText || "").trim();
            const txtNumero = (elNumero.textContent || elNumero.innerText || "").trim();
            
            const matchPos = txtPremio.match(/(\d{1,2})/);
            // Remove pontos e traços antes de verificar (ex: 5.354 -> 5354)
            const numeroLimpo = txtNumero.replace(/\D/g, '');
            
            if (matchPos && numeroLimpo.length === 4) {
              const pos = parseInt(matchPos[1]);
              const num = parseInt(numeroLimpo);
              // Só preenche se estiver vazio (prioriza o primeiro encontrado no HTML, que geralmente é o mais recente)
              if (pos >= 1 && pos <= 10 && premiosEncontrados[pos - 1] === undefined) {
                premiosEncontrados[pos - 1] = num;
              }
            }
          }
        }

        // ESTRATÉGIA 1.5: Tabela Estruturada (Novo - Para bancas que usam tables)
        // Procura tabelas onde uma célula é índice (1-10) e outra é valor (4 dígitos)
        const tabelas = doc.querySelectorAll('table');
        for (let tabela of tabelas) {
          const linhasTabela = tabela.querySelectorAll('tr');
          
          for (let tr of linhasTabela) {
            const tds = tr.querySelectorAll('td, th');
            if (tds.length >= 2) {
              let pos = -1;
              let val = -1;

              for (let td of tds) {
                const txt = (td.textContent || "").trim();
                
                // Verifica se é posição (1º, 1, 1°, etc)
                const matchPos = txt.match(/^(\d{1,2})[ºo°ª]?$/);
                if (matchPos) {
                  const p = parseInt(matchPos[1]);
                  if (p >= 1 && p <= 10) pos = p;
                }

                // Verifica se é valor (4 dígitos ou 1.234)
                // Remove pontos para verificar
                const txtLimpo = txt.replace(/\./g, '');
                if (/^\d{4}$/.test(txtLimpo)) {
                   const v = parseInt(txtLimpo);
                   // Filtra anos
                   if (v < anoAtual - 1 || v > anoAtual + 1) val = v;
                }
              }

              // Se achou par (Posição + Valor) na mesma linha
              if (pos !== -1 && val !== -1) {
                if (premiosEncontrados[pos - 1] === undefined) {
                  premiosEncontrados[pos - 1] = val;
                }
              }
            }
          }
        }

        // SE A ESTRATÉGIA 1 (HTML ESPECÍFICO) FUNCIONOU, RETORNA IMEDIATAMENTE
        // Isso garante que pegamos exatamente o resultado da estrutura correta e ignoramos o resto
        const validosEstrategia1 = premiosEncontrados.filter(n => n !== undefined);
        if (validosEstrategia1.length >= 5) {
          // Salva na grade antes de retornar
          resultadosPorBanca[bancaDestaUrl] = { valores: validosEstrategia1, horario: horarioDetectado || "Hoje" };
          if (bancaDestaUrl) {
             return { valores: resultadosPorBanca[bancaDestaUrl].valores, origem: 'real', horario: horarioDetectado, fonte: url, bancaDetectada: bancaDestaUrl };
          }
          return { valores: validosEstrategia1, origem: 'real', horario: horarioDetectado, fonte: url };
        }

        // ESTRATÉGIA 2: Busca sequencial de prêmios (1º ao 10º)
        // Procura padrões como "1º ... 1234", "2º ... 5678"
        const linhas = doc.querySelectorAll('tr, li, .resultado-item, p, div, td');
        
        for (let linha of linhas) {
          const texto = (linha.textContent || linha.innerText || "").replace(/\s+/g, ' ').trim();
          // Regex mais flexível para capturar posição (1-10) e o milhar (4 dígitos)
          // Aceita "1º 1234", "1 1234", "1º Prêmio: 1234", "1• 1234", "1º 5.354", "1 : 1234"
          // Melhorado para não pegar datas ou telefones parciais
          const match = texto.match(/(?:^|\D)(\d{1,2})[ºo°ª]?\s*(?:Prêmio|Premio)?\s*[:.•-]?\s*(\d{1}\.\d{3}|\d{4})(?!\d)/i);
          
          if (match) {
            const pos = parseInt(match[1]);
            const rawNum = match[2].replace(/\D/g, ''); // Remove pontos
            if (rawNum.length !== 4) continue;
            const num = parseInt(rawNum);
            
            // Valida se não é ano e se a posição é válida (1 a 10)
            if (num >= anoAtual - 1 && num <= anoAtual + 1) continue;
            
            if (pos >= 1 && pos <= 10) {
              if (premiosEncontrados[pos - 1] === undefined) {
                premiosEncontrados[pos - 1] = num; // Array index 0 é o 1º prêmio
              }
            }
          }
        }

        // ESTRATÉGIA 2: Busca Global no texto (caso a estrutura HTML seja complexa)
        // Isso garante que acharemos os números mesmo se o site mudar as tags HTML
        if (premiosEncontrados.filter(n => n !== undefined).length < 5) {
          const textoTotal = doc.body.textContent || doc.body.innerText || "";
          const regexGlobal = /(?:^|\D)(\d{1,2})[ºo°ª]?\s*(?:Prêmio|Premio)?\s*[:.•-]?\s*(\d{1}\.\d{3}|\d{4})(?!\d)/gi;
          let m;
          while ((m = regexGlobal.exec(textoTotal)) !== null) {
            const pos = parseInt(m[1]);
            const rawNum = m[2].replace(/\D/g, '');
            if (rawNum.length !== 4) continue;
            const num = parseInt(rawNum);
            if (num >= anoAtual - 1 && num <= anoAtual + 1) continue;
            if (pos >= 1 && pos <= 10 && premiosEncontrados[pos - 1] === undefined) {
              premiosEncontrados[pos - 1] = num;
            }
          }
        }

        // Limpa slots vazios do array
        const premiosFinais = premiosEncontrados.filter(n => n !== undefined);

        if (premiosFinais.length > 0) {
          // Salva na grade antes de retornar
          resultadosPorBanca[bancaDestaUrl] = { valores: premiosFinais, horario: horarioDetectado || "Hoje" };
          if (bancaDestaUrl) {
             return { valores: resultadosPorBanca[bancaDestaUrl].valores, origem: 'real', horario: horarioDetectado, fonte: url, bancaDetectada: bancaDestaUrl };
          }
          return { valores: premiosFinais, origem: 'real', horario: horarioDetectado, fonte: url };
        }

        // FALLBACK: Se não achou com posições, pega os primeiros 10 números de 4 dígitos encontrados
        const textoPagina = doc.body.textContent || doc.body.innerText || "";
        const todosMilhares = textoPagina.match(/\b\d{4}\b/g);
        if (todosMilhares) {
          const unicos = [];
          for (let numStr of todosMilhares) {
            const num = parseInt(numStr);
            if (num < anoAtual - 1 || num > anoAtual + 1) {
              if (!unicos.includes(num)) unicos.push(num);
            }
            if (unicos.length >= 10) break;
          }
          if (unicos.length > 0) {
             // Salva na grade antes de retornar
             resultadosPorBanca[bancaDestaUrl] = { valores: unicos, horario: horarioDetectado || "Hoje" };
             if (bancaDestaUrl) {
                return { valores: resultadosPorBanca[bancaDestaUrl].valores, origem: 'real', horario: horarioDetectado, fonte: url, bancaDetectada: bancaDestaUrl };
             }
             return { valores: unicos, origem: 'real', horario: horarioDetectado, fonte: url };
          }
        }

      } catch (e) {
        // console.warn(`Falha ao tentar ${url}:`, e); // Silencia erros individuais para não poluir
      }
    }
    return null; // Se falhar todos proxies desta URL
}

// ============================
// CONTROLE DO TIMER
// ============================

function iniciarTimer() {
  if (intervaloTimer) clearInterval(intervaloTimer);
  intervaloTimer = setInterval(() => {
    tempoRestante--;
    if (timerDisplay) timerDisplay.innerText = `Próxima verificação em: ${tempoRestante}s`;
    if (tempoRestante <= 0) realizarSorteio();
  }, 1000);
}

function iniciarMonitoramento() {
  realizarSorteio();
}

// Iniciar o sistema
if (document.getElementById("bichos")) {
  iniciarMonitoramento();
}

// Carregar carrinho ao abrir
window.addEventListener("load", () => {
  atualizarBoletim();
  renderizarHistorico();
  adicionarMascote();
  atualizarListaBilhetes();

  // Recupera o último resultado para permitir conferência imediata
  const historico = JSON.parse(localStorage.getItem("historicoResultados")) || [];
  if (historico.length > 0) {
    ultimoResultado = historico[0].valores;
    atualizarResultado(ultimoResultado); // Mostra o último resultado na tela ao carregar
  }
});

// ============================
// HISTÓRICO DE RESULTADOS
// ============================

function atualizarHistorico(resultado) {
  let historico = JSON.parse(localStorage.getItem("historicoResultados")) || [];
  
  // Evita duplicatas (mesmo resultado consecutivo)
  if (historico.length > 0) {
    const ultimo = historico[0];
    // Compara apenas o 1º prêmio para simplificar
    if (JSON.stringify(ultimo.valores) === JSON.stringify(resultado.valores)) {
      return;
    }
  }

  historico.unshift({
    valores: resultado.valores,
    horario: resultado.horario,
    fonte: resultado.fonte,
    timestamp: Date.now()
  });

  // Mantém apenas os últimos 3
  if (historico.length > 3) historico = historico.slice(0, 3);

  localStorage.setItem("historicoResultados", JSON.stringify(historico));
  renderizarHistorico();
}

function renderizarHistorico() {
  const divResultado = document.getElementById("resultado");
  if (!divResultado) return;

  let container = document.getElementById("historico-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "historico-container";
    container.style.marginTop = "25px";
    container.style.paddingTop = "20px";
    container.style.borderTop = "1px solid rgba(255,255,255,0.1)";
    divResultado.appendChild(container);
  }

  const historico = JSON.parse(localStorage.getItem("historicoResultados")) || [];
  
  if (historico.length === 0) return;

  const html = `
    <h3 style="font-size: 13px; color: #94a3b8; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
      📜 Últimos 3 Sorteios
    </h3>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${historico.map(item => {
        const primeiro = item.valores[0];
        const dezena = primeiro % 100;
        const bichoObj = bichos.find(b => b.nums.includes(dezena));
        const bicho = bichoObj ? bichoObj.nome : "---";
        const bichoIndex = bichoObj ? bichos.indexOf(bichoObj) : -1;
        
        let fonteNome = "LOTECE";
        try {
           if (item.fonte) fonteNome = new URL(item.fonte).hostname.replace("www.", "").split(".")[0].toUpperCase();
        } catch(e) {}

        return `
          <div style="background: rgba(15, 23, 42, 0.4); padding: 10px 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.2s;">
            <div style="text-align: left;">
              <div style="font-size: 10px; color: #00ffd5; font-weight: bold; margin-bottom: 3px; background: rgba(0, 255, 213, 0.1); padding: 2px 6px; border-radius: 4px; display: inline-block;">
                ${fonteNome} ${item.horario || ""}
              </div>
              <div style="font-size: 10px; opacity: 0.5; margin-top: 4px;">
                ${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="text-align: right;">
                <div style="font-size: 16px; font-weight: bold; color: #fff; letter-spacing: 1px; font-family: 'Inter', monospace;">
                  ${String(primeiro).padStart(4, '0')}
                </div>
                <div style="font-size: 11px; color: #ffd166; font-weight: 600;">
                  ${bicho.toUpperCase()}
                </div>
              </div>
              <div style="width: 32px; height: 32px; border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;">
                <img src="imagens/${bichoIndex + 1}.png" 
                     style="width: 90%; height: 90%; object-fit: contain;"
                     onerror="this.style.display='none'">
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
}

// ============================
// MEUS BILHETES (NOVO)
// ============================

window.atualizarListaBilhetes = async function() {
  const container = document.getElementById("lista-bilhetes");
  if (!container) return;

  const usuario = obterUsuario();
  if (!usuario) {
    container.innerHTML = '<p class="vazio">Faça login para ver seus bilhetes.</p>';
    return;
  }

  try {
    const q = window.query(
      window.collection(window.db, "apostas"),
      window.where("userId", "==", usuario.id)
    );
    const snapshot = await window.getDocs(q);
    let historico = [];
    snapshot.forEach(doc => historico.push(doc.data()));
    
    // Ordenar por data (timestamp) decrescente
    historico.sort((a, b) => b.timestamp - a.timestamp);

    if (historico.length === 0) {
      container.innerHTML = '<p class="vazio">Nenhum bilhete registrado.</p>';
      return;
    }

    container.innerHTML = historico.map(aposta => {
      const statusClass = aposta.status.toLowerCase();
      const descricao = aposta.tipo === 'grupo' ? `Grupo ${aposta.nomeBicho}` : `${aposta.tipo.toUpperCase()}: ${aposta.numero}`;
      
      return `
        <div class="bilhete-card ${statusClass}">
          <div class="bilhete-info">
            <div class="bilhete-topo">
              <strong>${descricao}</strong>
              <span class="badge-status ${statusClass}">${aposta.status}</span>
            </div>
            <div class="bilhete-detalhes">
              <span>${aposta.banca} • ${aposta.horario}</span>
              <span>${aposta.dataAposta}</span>
            </div>
            <div class="bilhete-valor">
              Aposta: ${formatarBRL(aposta.valor)}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error("Erro ao carregar bilhetes:", e);
  }
};

window.limparBilhetesAntigos = async function() {
  if(!confirm("Deseja apagar TODO o histórico de bilhetes da nuvem?")) return;
  const usuario = obterUsuario();
  if (!usuario) return;

  try {
    const q = window.query(window.collection(window.db, "apostas"), window.where("userId", "==", usuario.id));
    const snapshot = await window.getDocs(q);
    const batchPromises = [];
    snapshot.forEach(doc => batchPromises.push(window.deleteDoc(doc.ref)));
    await Promise.all(batchPromises);
    atualizarListaBilhetes();
  } catch(e) {
    alert("Erro ao limpar: " + e.message);
  }
};

// ============================
// MASCOTE
// ============================

function adicionarMascote() {
  const header = document.querySelector("header");
  if (header && !document.querySelector(".mascote-header")) {
    const img = document.createElement("img");
    // Tenta carregar imagens/mascote.png, se falhar usa um placeholder
    img.src = "imagens/mascote.png"; 
    img.onerror = () => { 
      // Se falhar o PNG, tenta JPG. Se falhar ambos, usa placeholder.
      if (img.src.endsWith("mascote.png")) {
        img.src = "imagens/mascote.jpg";
      } else {
        img.src = "https://placehold.co/150x150/1e293b/00ffd5?text=Mascote"; 
      }
    };
    img.alt = "Mascote Oficial";
    img.className = "mascote-header";
    header.insertBefore(img, header.firstChild);
  }
}

// ============================
// MODAL DE COTAÇÕES
// ============================

function abrirModalCotacoes() {
  document.getElementById("modal-cotacoes").style.display = "block";
}

function fecharModalCotacoes() {
  document.getElementById("modal-cotacoes").style.display = "none";
}

// Fecha ao clicar fora da imagem
window.onclick = (event) => {
  const modal = document.getElementById("modal-cotacoes");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// ============================
// FUNÇÕES GLOBAIS AUXILIARES
// ============================

window.obterUsuario = function() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
};

window.atualizarSaldo = function(valor) {
  const usuario = obterUsuario();
  if (usuario) {
    usuario.saldo = valor;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    const elSaldo = document.getElementById("user-saldo");
    if (elSaldo) elSaldo.innerText = valor.toFixed(2);
    const elSaldoDisp = document.getElementById("saldo-disponivel");
    if (elSaldoDisp) elSaldoDisp.innerText = valor.toFixed(2);
  }
};
