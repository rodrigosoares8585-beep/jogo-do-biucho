// =====================
// GERENCIAMENTO DE SESSÃO
// =====================

async function verificarSessao() {
  const usuarioLogado = localStorage.getItem("usuarioLogado");

  if (!usuarioLogado) {
    // Se não está logado, redireciona para login
    window.location.href = "auth.html";
    return null;
  }

  const usuarioSessao = JSON.parse(usuarioLogado);
  
  // VERIFICAÇÃO DE SEGURANÇA: Confere no Firestore (Nuvem)
  try {
    // Aguarda o Firebase carregar se necessário
    if (!window.db) await new Promise(r => setTimeout(r, 500));

    const docRef = window.doc(window.db, "usuarios", usuarioSessao.id);
    const docSnap = await window.getDoc(docRef);

    if (!docSnap.exists()) {
      alert("Sessão expirada ou conta excluída.");
      fazerLogout(false); // Logout sem confirmação
      return null;
    }

    const dados = docSnap.data();
    if (dados.bloqueado) {
      alert("🚫 Sua conta foi bloqueada pelo administrador.");
      fazerLogout(false);
      return null;
    }

    // Atualiza a sessão local com os dados mais recentes da nuvem (ex: saldo que mudou)
    const usuarioAtualizado = { ...usuarioSessao, ...dados };
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
    exibirDadosUsuario(usuarioAtualizado);
    return usuarioAtualizado;

  } catch (e) {
    console.error("Erro ao verificar sessão online:", e);
    // Se der erro (ex: sem internet), usa os dados locais por enquanto
    exibirDadosUsuario(usuarioSessao);
    return usuarioSessao;
  }
}

function exibirDadosUsuario(usuario) {
  document.getElementById("user-info").style.display = "flex";
  document.getElementById("user-nome").textContent = usuario.nome;
  document.getElementById("user-saldo").textContent = usuario.saldo.toFixed(2);

  // Mostra o botão de admin se o usuário for admin
  const adminBtn = document.getElementById("admin-btn");
  if (adminBtn) {
    adminBtn.style.display = usuario.isAdmin ? 'inline-block' : 'none';
  }
}

function fazerLogout(confirmar = true) {
  if (!confirmar || confirm("Deseja realmente sair?")) {
    if (window.auth) window.signOut(window.auth).catch(console.error);
    localStorage.removeItem("usuarioLogado");
    window.location.href = "auth.html";
  }
}

function irParaPagamento() {
  window.location.href = "pagamento.html";
}

function abrirAdmin() {
  const usuario = obterUsuario();
  
  // Se já for admin, entra direto
  if (usuario && usuario.isAdmin) {
    window.location.href = "admin.html";
  } else {
    // Se não for, pede senha secreta
    const senha = prompt("🔐 ACESSO RESTRITO\nDigite a senha de administrador:");
    
    if (senha === "admin") { // Senha padrão
      if (usuario) {
        // Promove o usuário a Admin
        usuario.isAdmin = true;
        localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
        atualizarUsuarioNoBanco(usuario); // Salva permanentemente
        
        alert("✅ Acesso concedido! Você agora é Administrador.");
        window.location.href = "admin.html";
      } else {
        alert("⚠️ Faça login primeiro para acessar o painel.");
      }
    } else if (senha !== null) {
      alert("❌ Senha incorreta.");
    }
  }
}

function obterUsuario() {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (!usuarioLogado) return null;
  return JSON.parse(usuarioLogado);
}

function atualizarSaldo(novoSaldo) {
  const usuario = obterUsuario();
  if (usuario) {
    usuario.saldo = novoSaldo;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    document.getElementById("user-saldo").textContent = novoSaldo.toFixed(2);
    atualizarUsuarioNoBanco(usuario);
  }
}

async function atualizarUsuarioNoBanco(usuarioAtualizado) {
  if (!window.db || !window.updateDoc || !window.doc) return;
  
  try {
    const userRef = window.doc(window.db, "usuarios", usuarioAtualizado.id);
    await window.updateDoc(userRef, {
      saldo: usuarioAtualizado.saldo,
      isAdmin: usuarioAtualizado.isAdmin
    });
  } catch (e) {
    console.error("Erro ao sincronizar saldo com a nuvem:", e);
  }
}

// Verificar sessão ao carregar
window.addEventListener("load", () => {
  verificarSessao();
});
