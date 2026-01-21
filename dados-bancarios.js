// ==============================
// GERENCIAMENTO DE DADOS BANCÁRIOS
// ==============================

window.addEventListener("load", () => {
  carregarDadosBancarios();
});

function carregarDadosBancarios() {
  const usuario = obterUsuario();
  if (!usuario) return;

  const dados = JSON.parse(localStorage.getItem(`dados_bancarios_${usuario.id}`));

  if (dados) {
    exibirDadosCadastrados(dados);
  } else {
    exibirFormulario();
  }
}

function exibirDadosCadastrados(dados) {
  document.getElementById("formulario-dados").style.display = "none";
  document.getElementById("dados-existentes").style.display = "block";

  document.getElementById("cpf-display").textContent = mascaraCPF(dados.cpf);
  document.getElementById("banco-display").textContent = obterNomeBanco(dados.banco);
  document.getElementById("agencia-display").textContent = dados.agencia;
  document.getElementById("conta-display").textContent = "*".repeat(dados.conta.length - 2) + dados.conta.slice(-2);
  document.getElementById("titular-display").textContent = dados.titular;
}

function exibirFormulario() {
  document.getElementById("formulario-dados").style.display = "block";
  document.getElementById("dados-existentes").style.display = "none";
}

function salvarDadosBancarios() {
  const usuario = obterUsuario();
  if (!usuario) return alert("Faça login primeiro!");

  const cpf = document.getElementById("cpf").value.replace(/\D/g, "");
  const banco = document.getElementById("banco").value;
  const agencia = document.getElementById("agencia").value;
  const conta = document.getElementById("conta").value;
  const tipoConta = document.getElementById("tipo-conta").value;
  const titular = document.getElementById("titular").value.toUpperCase();

  // Validações
  if (!validarCamposBancarios(cpf, banco, agencia, conta, tipoConta, titular)) {
    return;
  }

  if (!validarCPF(cpf)) {
    alert("CPF inválido! Verifique o número digitado.");
    return;
  }

  // Criptografia básica (em produção use bcrypt)
  const dadosCriptografados = {
    cpf: cpf,
    banco: banco,
    agencia: agencia,
    conta: conta,
    tipoConta: tipoConta,
    titular: titular,
    criadoEm: new Date().toLocaleDateString("pt-BR"),
    ultimaAlteracao: new Date().toLocaleDateString("pt-BR")
  };

  localStorage.setItem(`dados_bancarios_${usuario.id}`, JSON.stringify(dadosCriptografados));

  alert("✅ Dados bancários cadastrados com sucesso!\n\nAgora você pode solicitar saques.");
  carregarDadosBancarios();
}

function editarDados() {
  if (confirm("Deseja editar seus dados bancários?")) {
    const usuario = obterUsuario();
    localStorage.removeItem(`dados_bancarios_${usuario.id}`);
    carregarDadosBancarios();
  }
}

function deletarDados() {
  if (confirm("Tem certeza que deseja deletar seus dados bancários?\n\nVocê não poderá fazer saques sem registrar novos dados.")) {
    const usuario = obterUsuario();
    localStorage.removeItem(`dados_bancarios_${usuario.id}`);
    alert("Dados deletados com sucesso!");
    carregarDadosBancarios();
  }
}

// ==================
// VALIDAÇÕES
// ==================

function validarCamposBancarios(cpf, banco, agencia, conta, tipoConta, titular) {
  if (!cpf || cpf.length !== 11) {
    alert("CPF inválido!");
    return false;
  }

  if (!banco) {
    alert("Selecione um banco!");
    return false;
  }

  if (!agencia || agencia.length < 4) {
    alert("Agência deve ter no mínimo 4 dígitos!");
    return false;
  }

  if (!conta || conta.length < 8) {
    alert("Conta deve ter no mínimo 8 dígitos!");
    return false;
  }

  if (!tipoConta) {
    alert("Selecione o tipo de conta!");
    return false;
  }

  if (!titular || titular.length < 5) {
    alert("Nome do titular deve ter no mínimo 5 caracteres!");
    return false;
  }

  return true;
}

function validarCPF(cpf) {
  // Remover caracteres especiais
  cpf = cpf.replace(/\D/g, "");

  // Verificar se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Algoritmo de validação do CPF
  let soma = 0;
  let resto;

  // Validar primeiro dígito
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Validar segundo dígito
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// ==================
// UTILIDADES
// ==================

function mascaraCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function obterNomeBanco(codigo) {
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

function obterDadosBancarios() {
  const usuario = obterUsuario();
  if (!usuario) return null;

  return JSON.parse(localStorage.getItem(`dados_bancarios_${usuario.id}`));
}

function voltarPagamento() {
  window.location.href = "pagamento.html";
}

// Formatar CPF enquanto digita
document.addEventListener("DOMContentLoaded", () => {
  const inputCPF = document.getElementById("cpf");
  if (inputCPF) {
    inputCPF.addEventListener("input", (e) => {
      let valor = e.target.value.replace(/\D/g, "");
      if (valor.length > 0) {
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      }
      e.target.value = valor;
    });
  }
});
