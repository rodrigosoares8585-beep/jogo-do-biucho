// ========================
// SISTEMA DE AUTENTICAÇÃO
// ========================

function alternarForm(event) {
  event.preventDefault();
  document.getElementById("login-form").classList.toggle("active");
  document.getElementById("register-form").classList.toggle("active");
  limparMensagens();
}

function limparMensagens() {
  document.getElementById("mensagem-erro").textContent = "";
  document.getElementById("mensagem-sucesso").textContent = "";
}

function mostrarErro(mensagem) {
  limparMensagens();
  document.getElementById("mensagem-erro").textContent = "❌ " + mensagem;
}

function mostrarSucesso(mensagem) {
  limparMensagens();
  document.getElementById("mensagem-sucesso").textContent = "✅ " + mensagem;
}

// Função auxiliar para esperar o Firebase carregar
async function aguardarFirebase() {
  if (window.auth && window.signInWithEmailAndPassword) return;
  
  // Feedback visual no botão
  const btn = document.querySelector('.auth-form.active button');
  const textoOriginal = btn ? btn.innerText : "Processando...";
  if (btn) {
    btn.innerText = "Conectando...";
    btn.disabled = true;
  }

  return new Promise((resolve, reject) => {
    let tentativas = 0;
    const check = setInterval(() => {
      tentativas++;
      if (window.auth && window.signInWithEmailAndPassword) { 
        clearInterval(check); 
        if (btn) { btn.innerText = textoOriginal; btn.disabled = false; }
        resolve(); 
      } else if (tentativas > 50) { // Espera até 5 segundos
        clearInterval(check);
        if (btn) { btn.innerText = "Erro de Conexão"; btn.disabled = false; }
        const msg = "O Firebase não carregou.\n\n⚠️ Se você abriu o arquivo direto (file://), o navegador bloqueia a conexão.\nUse o 'Live Server' no VS Code ou coloque o site online.";
        alert(msg);
        reject(new Error(msg));
      }
    }, 100);
  });
}

// REGISTRO
async function fazerRegistro() {
  const nome = document.getElementById("register-nome").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const senha = document.getElementById("register-senha").value;
  const senhaConf = document.getElementById("register-senha-conf").value;

  // Validações
  if (!nome || !email || !senha || !senhaConf) {
    mostrarErro("Preencha todos os campos!");
    return;
  }

  if (senha.length < 6) {
    mostrarErro("A senha deve ter no mínimo 6 caracteres!");
    return;
  }

  if (senha !== senhaConf) {
    mostrarErro("As senhas não conferem!");
    return;
  }

  if (!validarEmail(email)) {
    mostrarErro("Email inválido!");
    return;
  }

  try {
    await aguardarFirebase(); // Espera a conexão antes de continuar
    // 1. Criar usuário no Firebase Authentication
    const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, senha);
    const user = userCredential.user;

    // 2. Salvar dados adicionais no Firestore (banco de dados)
    const novoUsuario = {
      id: user.uid, // Usa o ID único do Firebase
      nome: nome,
      email: email,
      saldo: 0,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      isAdmin: false
    };

    // Salva na coleção "usuarios" usando o UID como chave do documento
    await window.setDoc(window.doc(window.db, "usuarios", user.uid), novoUsuario);

    mostrarSucesso("Conta criada com sucesso! Faça login para continuar.");

    setTimeout(() => {
      document.getElementById("register-email").value = "";
      document.getElementById("register-nome").value = "";
      document.getElementById("register-senha").value = "";
      document.getElementById("register-senha-conf").value = "";
      alternarForm({ preventDefault: () => {} });
      document.getElementById("login-email").value = email;
    }, 1500);

  } catch (error) {
    console.error("Erro no registro:", error);
    if (error.code === 'auth/email-already-in-use') {
      mostrarErro("Este email já está registrado!");
    } else if (error.code === 'auth/weak-password') {
      mostrarErro("A senha é muito fraca (mínimo 6 caracteres).");
    } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
      mostrarErro("Erro de Configuração: Ative o 'Email/Senha' no Firebase Console.");
    } else {
      mostrarErro("Erro ao criar conta: " + error.message);
    }
  }
}

// LOGIN
async function fazerLogin() {
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-senha").value;

  if (!email || !senha) {
    mostrarErro("Preencha email e senha!");
    return;
  }

  try {
    await aguardarFirebase(); // Espera a conexão antes de continuar
    // 1. Autenticar com Firebase Auth
    const userCredential = await window.signInWithEmailAndPassword(window.auth, email, senha);
    const user = userCredential.user;

    // 2. Buscar dados extras no Firestore (saldo, admin, bloqueio)
    const docRef = window.doc(window.db, "usuarios", user.uid);
    const docSnap = await window.getDoc(docRef);

    if (!docSnap.exists()) {
      mostrarErro("Erro: Usuário não encontrado no banco de dados.");
      return;
    }

    const dadosUsuario = docSnap.data();

    if (dadosUsuario.bloqueado) {
      mostrarErro("🚫 Conta bloqueada! Entre em contato com o suporte.");
      await window.signOut(window.auth); // Desloga do Firebase se estiver bloqueado
      return;
    }

    // 3. Salvar sessão local (Mantendo compatibilidade com o resto do site)
    localStorage.setItem("usuarioLogado", JSON.stringify({
      id: user.uid,
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      saldo: dadosUsuario.saldo,
      isAdmin: dadosUsuario.isAdmin || false
    }));

    mostrarSucesso("Login realizado com sucesso!");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    console.error("Erro no login:", error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      mostrarErro("Email ou senha incorretos!");
    } else if (error.code === 'auth/too-many-requests') {
      mostrarErro("Muitas tentativas. Tente novamente mais tarde.");
    } else {
      mostrarErro("Erro ao entrar: " + error.message);
    }
  }
}

// VALIDAR EMAIL
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// AUTO-LOGIN (se já está logado)
window.addEventListener("load", () => {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (usuarioLogado) {
    window.location.href = "index.html";
    return;
  }
});
