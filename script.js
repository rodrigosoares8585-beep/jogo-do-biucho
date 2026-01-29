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
  terno_grupo: 1500, // 1º ao 5º
  
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
  "PT-Rio", "PT Rio", "PT-SP", "PT SP", "Nacional", "Goiás", "Bahia", "Ceará", "Brasília",
  "CL", "Preferida", "Salvation", "Corujinha", "Amnésia", "Ouro", "União", 
  "Adesp", "Global", "Local", "Águia", "Fênix", "Ponte", "Sorte", "Confiança",
  "Redenção", "Vila", "Capital", "Cotepe", "Potiguar", "Jangadeiro", "Seninha",
  "Alvorada", "Loteria dos Sonhos", "Pernambuco",
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
    
    // Se tivermos resultados em cache, mostra eles mesmo com erro na atualização
    if (Object.keys(resultadosPorBanca).length > 0) {
        renderizarGradeResultados();
    }

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
           limite = 4; // Índices 0-4 (1º ao 5º)
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
  let wrapper = document.getElementById("grade-bancas-wrapper");
  
  // Cria o wrapper se não existir
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "grade-bancas-wrapper";
    // Insere logo após o resultado principal
    const mainResult = document.getElementById("resultado");
    if (mainResult) mainResult.parentNode.insertBefore(wrapper, mainResult.nextSibling);
  }

  const bancas = Object.keys(resultadosPorBanca);
  
  if (bancas.length === 0) {
    wrapper.innerHTML = "";
    return;
  }

  const btnStyle = "background:rgba(0, 255, 213, 0.1); border:1px solid #00ffd5; color:#00ffd5; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:11px; transition:all 0.2s; display:flex; align-items:center; gap:5px;";

  // 1. HEADER (Cria ou Atualiza)
  let header = wrapper.querySelector(".grade-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "grade-header";
    header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin: 30px 0 15px 0; padding: 0 5px;";
    wrapper.appendChild(header);
  }

  const headerHTML = `
      <h3 style="margin:0; color:#94a3b8; font-size:14px; text-transform:uppercase; letter-spacing:1px;">
        📊 Resultados por Banca (${bancas.length})
      </h3>
      <button onclick="exportarResultadosCSV()" style="${btnStyle}" onmouseover="this.style.background='#00ffd5';this.style.color='#0f172a'" onmouseout="this.style.background='rgba(0, 255, 213, 0.1)';this.style.color='#00ffd5'">
        📥 Baixar CSV
      </button>
  `;
  if (header.innerHTML !== headerHTML) header.innerHTML = headerHTML;

  // 2. GRID (Cria ou Seleciona)
  let grid = wrapper.querySelector(".grade-bancas");
  if (!grid) {
    grid = document.createElement("div");
    grid.className = "grade-bancas";
    wrapper.appendChild(grid);
  }

  // 3. CARDS (Atualiza individualmente para evitar piscar)
  bancas.forEach(banca => {
    const dados = resultadosPorBanca[banca];
    const cardId = `card-${banca.replace(/[^a-zA-Z0-9]/g, '-')}`;
    let card = document.getElementById(cardId);

    const cardHTML = `
            <h4>${banca} <span style="float:right; opacity:0.5; font-size:10px;">${dados.horario || ''}</span></h4>
            <div class="numeros-lista">
              ${dados.valores.map((n, i) => `
                <div class="linha-result">
                  <span>${i + 1}º</span>
                  <strong>${String(n).padStart(4, '0')}</strong>
                </div>
              `).join('')}
            </div>
    `;

    if (!card) {
      card = document.createElement("div");
      card.className = "card-banca-mini";
      card.id = cardId;
      card.innerHTML = cardHTML;
      grid.appendChild(card);
    } else if (card.innerHTML !== cardHTML) {
      card.innerHTML = cardHTML;
    }
  });
}

// Função Principal: Busca o primeiro resultado rápido e dispara o resto em background
async function buscarResultadoLoteriaSonho() {
  // A fonte principal agora é a página que agrega todas as bancas.
  const fontes = [
    'https://bancasdobicho.com.br/bancas'
  ];

  // Configuração de proxies (Mantida a rotação que funciona bem)
  const proxies = [
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

  // NÃO limpamos resultadosPorBanca = {} para evitar que os cards pisquem.
  // Os dados serão apenas atualizados/sobrescritos.

  // Tenta encontrar o resultado principal o mais rápido possível
  for (let i = 0; i < fontes.length; i++) {
    const url = fontes[i];
    const resultado = await processarFonte(url, proxies);
    
    if (resultado) {
      // Como agora usamos uma única fonte principal, não há mais "restantes".
      // A própria chamada já preenche a grade com todos os resultados da página.
      
      return resultado;
    }
  }
  
  // Fallback: Se falhou extração mas tem cache (ex: de uma execução anterior ou parcial)
  const bancasCache = Object.keys(resultadosPorBanca);
  if (bancasCache.length > 0) {
      const primeira = bancasCache[0];
      return {
          valores: resultadosPorBanca[primeira].valores,
          origem: 'cache',
          horario: resultadosPorBanca[primeira].horario,
          bancaDetectada: primeira
      };
  }

  throw new Error("Não foi possível extrair de nenhuma fonte");
}

// A função buscarBancasRestantes foi removida pois a nova fonte única já contém todos os dados.

// ============================================================
// NOVA LÓGICA DE EXTRAÇÃO (REFATORADA)
// ============================================================
async function processarFonte(url, proxies) {
  for (const proxy of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(proxy.getUrl(url), { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) continue;
        
        const htmlContent = await proxy.extract(response);
        if (!htmlContent) continue;

        if (htmlContent.includes("Attention Required! | Cloudflare") || htmlContent.includes("Just a moment...")) {
          continue;
        }

        // Analisa o HTML e extrai todas as bancas encontradas
        const dadosExtraidos = analisarHTML(htmlContent, url);
        
        // Se encontrou algo, retorna o primeiro resultado válido para o display principal
        if (dadosExtraidos) return dadosExtraidos;

      } catch (e) {
        // console.warn(`Falha ao tentar ${url}:`, e); // Silencia erros individuais para não poluir
      }
    }
    return null; // Se falhar todos proxies desta URL
}

function analisarHTML(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let resultadoPrincipal = null;

    // Limpeza de scripts/styles para evitar falsos positivos
    doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());

    // ============================================================
    // ESTRATÉGIA 1: Baseada no exemplo Python (Estrutura de Card)
    // ============================================================
    // Procura por containers com classe 'banca-card' ou similar, conforme seu exemplo
    const cards = doc.querySelectorAll('.banca-card, .card, .result-card, div[class*="card"], div[class*="result"]');
    
    if (cards.length > 0) {
        for (const card of cards) {
            try {
                // Tenta extrair nome (h3) e horário (span.hora) conforme exemplo Python
                const nomeEl = card.querySelector('h3, h2, .nome');
                const horaEl = card.querySelector('.hora, .time, span.hora');
                
                if (nomeEl) {
                    let bancaNome = nomeEl.textContent.trim();
                    let horario = horaEl ? horaEl.textContent.trim() : "";
                    
                    // Se não achou horário no span, tenta no texto do card
                    if (!horario) {
                        const matchH = /(\d{2}:\d{2})|(\d{2}h\d{2})/.exec(card.textContent);
                        if (matchH) horario = matchH[0];
                    }

                    // Busca números no card (milhares)
                    const textoCard = card.innerText || card.textContent || "";
                    const matches = textoCard.match(/(?:\b\d{4}\b|\b\d{1}\.\d{3}\b)/g);
                    
                    if (matches) {
                        const numeros = matches
                            .map(n => parseInt(n.replace(/\./g, '')))
                            .filter(n => n < 2023 || n > 2026);
                        const unicos = [...new Set(numeros)];

                        if (unicos.length >= 5) {
                            resultadosPorBanca[bancaNome] = { valores: unicos.slice(0, 10), horario: horario || "Hoje" };
                            
                            // Define principal se for prioridade
                            const ehPrioridade = /PT|Federal|Nacional|Rio/i.test(bancaNome);
                            if (!resultadoPrincipal || (ehPrioridade && !/PT|Federal|Nacional|Rio/i.test(resultadoPrincipal.bancaDetectada))) {
                                resultadoPrincipal = { valores: unicos.slice(0, 10), bancaDetectada: bancaNome, horario: horario };
                            }
                        }
                    }
                }
            } catch (e) {}
        }
    }

    // ESTRATÉGIA 2: Genérica e Robusta (Fallback)
    // Procura elementos que pareçam títulos de banca (contêm horário ou nome de banca)
    const candidatos = doc.querySelectorAll('h1, h2, h3, h4, h5, div, span, p, strong, b');

    for (const el of candidatos) {
        const texto = (el.textContent || "").trim();
        if (texto.length < 4 || texto.length > 150) continue;

        // Regex para horário (HH:MM ou HHhMM)
        const matchHorario = /(\d{2}:\d{2})|(\d{2}h\d{2})/.exec(texto);
        
        if (matchHorario) {
            // Verifica se é um título de banca conhecido ou tem palavras-chave
            const temNomeBanca = BANCAS.some(b => texto.toLowerCase().includes(b.toLowerCase()));
            const temPalavraChave = /resultado|jogo do bicho|deu no poste|banca/i.test(texto);
            
            if (temNomeBanca || temPalavraChave || texto.includes("-")) {
                const horario = matchHorario[0];
                
                // Extrai nome da banca
                let parts = texto.split(horario);
                let bancaNome = parts[0]
                    .replace(/[-–]/g, '')
                    .replace(/\d{2}\/\d{2}\/\d{4}/, '') // Remove data
                    .trim();
                
                // Se o nome estava depois do horário (ex: 14:00 PT Rio)
                if (bancaNome.length < 2 && parts[1]) {
                    bancaNome = parts[1]
                        .replace(/[-–]/g, '')
                        .replace(/\d{2}\/\d{2}\/\d{4}/, '')
                        .trim();
                }

                if (bancaNome.length < 2) bancaNome = "Banca " + horario;
                
                // Evita duplicar se a Estratégia 1 já pegou
                if (resultadosPorBanca[bancaNome]) continue;

                // Busca números no container pai e arredores
                let container = el.parentElement;
                let textoBusca = container.innerText || container.textContent || "";

                // Se o container for pequeno, sobe um nível (mas não até o body)
                if (textoBusca.length < 50 && container.parentElement && container.parentElement.tagName !== 'BODY') {
                    container = container.parentElement;
                    textoBusca = container.innerText || container.textContent || "";
                }

                // Se não achou números, tenta o próximo elemento irmão (caso o título esteja separado)
                if (!/\d{4}/.test(textoBusca)) {
                    let proximo = el.nextElementSibling;
                    if (proximo) {
                        textoBusca += " " + (proximo.innerText || proximo.textContent || "");
                    }
                }

                // Extrai milhares (4 dígitos ou 1.234)
                // Regex compatível (sem lookbehind) para evitar erros em Safari/iOS antigos
                const matches = textoBusca.match(/(?:\b\d{4}\b|\b\d{1}\.\d{3}\b)/g);
                
                if (matches) {
                    const numeros = matches
                        .map(n => parseInt(n.replace(/\./g, '')))
                        .filter(n => n < 2023 || n > 2026); // Filtra anos
                    
                    const unicos = [...new Set(numeros)];

                    if (unicos.length >= 5) {
                        // Salva resultado
                        resultadosPorBanca[bancaNome] = {
                            valores: unicos.slice(0, 10),
                            horario: horario
                        };

                        // Define principal (prioriza PT/Federal se achar)
                        const ehPrioridade = /PT|Federal|Nacional|Rio/i.test(bancaNome);
                        if (!resultadoPrincipal || (ehPrioridade && !/PT|Federal|Nacional|Rio/i.test(resultadoPrincipal.bancaDetectada))) {
                            resultadoPrincipal = {
                                valores: unicos.slice(0, 10),
                                bancaDetectada: bancaNome,
                                horario: horario
                            };
                        }
                    }
                }
            }
        }
    }

    // Retorna o objeto para a função principal se algo foi encontrado
    if (resultadoPrincipal) {
        return {
            valores: resultadoPrincipal.valores,
            origem: 'real',
            horario: resultadoPrincipal.horario,
            fonte: url,
            bancaDetectada: resultadoPrincipal.bancaDetectada
        };
    }

    return null; // Nenhum resultado válido encontrado na página
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

// ============================
// EXPORTAÇÃO DE DADOS
// ============================

window.exportarResultadosCSV = function() {
  const bancas = Object.keys(resultadosPorBanca);
  if (bancas.length === 0) return alert("Nenhum resultado carregado para exportar.");

  // BOM para Excel reconhecer UTF-8
  let csvContent = "\uFEFF";
  csvContent += "Banca;Horário;1º Prêmio;2º Prêmio;3º Prêmio;4º Prêmio;5º Prêmio\n";

  bancas.forEach(banca => {
    const dados = resultadosPorBanca[banca];
    const valores = dados.valores.map(v => String(v).padStart(4, '0'));
    // Completa com vazios se faltar prêmio
    while (valores.length < 5) valores.push("");

    const linha = [
      banca,
      dados.horario || "-",
      ...valores.slice(0, 5)
    ].join(";");

    csvContent += linha + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `resultados_bicho_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
