const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbwvlrEtsmKArYI_7worA4POlnx5js2teJRRJZIhTHNNwPdAeAsxu-wJWKPcvEBqKD-x/exec";

document.addEventListener("DOMContentLoaded", () => {
    // Detecta se estamos na página do painel ou de login
    const isPainel = window.location.pathname.includes("painel.html");

    if (isPainel) {
        // ==========================================
        // PARTE 1: PAINEL DE CONTROLE (painel.html)
        // ==========================================
        const dadosSalvos = JSON.parse(localStorage.getItem("dadosComboio"));
        
        if (dadosSalvos) {
            const viewDeposito = document.getElementById("view-deposito");
            const viewFrota = document.getElementById("view-frota");
            const viewUnidade = document.getElementById("view-unidade");
            const viewNome = document.getElementById("view-nome");

            if (viewDeposito) viewDeposito.textContent = `CAM-${dadosSalvos.deposito}`;
            if (viewFrota) viewFrota.textContent = `Comboio-${dadosSalvos.frota}`;
            if (viewUnidade) viewUnidade.textContent = `Unidade: ${dadosSalvos.filial}`;
            if (viewNome) viewNome.textContent = dadosSalvos.nome;
        } else {
            alert("Sessão não encontrada. Por favor, efetue o login novamente.");
            window.location.href = "index.html";
            return;
        }

        // Botão Sair
        const btnSair = document.querySelector(".btn-sair button");
        if (btnSair) {
            btnSair.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("dadosComboio");
                window.location.href = "index.html";
            });
        }

        // Lógica dos inputs de estoque, barras e cores
        const itensEstoque = document.querySelectorAll(".info-estoque-lista");

        if (itensEstoque.length > 0) {
            itensEstoque.forEach(item => {
                const inputNumero = item.querySelector('input[type="number"]');
                const inputBarra = item.querySelector('input[type="range"]');
                const textoPorcentagem = item.querySelector('p');

                if (!inputNumero || !inputBarra) return;

                inputBarra.min = 0;
                inputBarra.max = 300;

                const atualizarStatus = () => {
                    let valor = parseFloat(inputNumero.value) || 0;

                    inputBarra.value = valor > 300 ? 300 : valor;

                    let cor = "";
                    // Abaixo de 50L: Vermelho (Crítico)
                    if (valor < 50) {
                        cor = "#e74c3c"; 
                    } 
                    // De 50 a 150L: Laranja/Amarelo (Atenção)
                    else if (valor >= 50 && valor <= 150) {
                        cor = "#f39c12"; 
                    } 
                    // Acima de 150 até 300L: Verde (Normal)
                    else {
                        cor = "#2ecc71"; 
                    }

                    inputBarra.style.setProperty('--accent-color', cor);

                    let porcentagem = Math.round((valor / 300) * 100);
                    if (porcentagem > 100) porcentagem = 100;
                    if (textoPorcentagem) {
                        textoPorcentagem.textContent = `${porcentagem}%`;
                        textoPorcentagem.style.color = cor;
                        textoPorcentagem.style.backgroundColor = `${cor}25`;
                    }
                };

                inputNumero.addEventListener("input", atualizarStatus);
                atualizarStatus();
            });
        }

    } else {
        
        // ==========================================
        // PARTE 2: TELA DE LOGIN (index.html)
        // ==========================================
        const campoFilial = document.getElementById('filial');
        const campoUnidade = document.getElementById('unidade');
        const inputFrota = document.getElementById('frota');
        const inputDeposito = document.getElementById('deposito');
        const inputCracha = document.getElementById('cracha');
        const inputNome = document.getElementById('nome');
        const btnEntrar = document.querySelector('.btn button');

        // Mapeamento dos códigos de unidade por filial
        const codigosUnidades = {
            "IGUATEMI": "1",
            "PARANACITY": "2",
            "TERRA RICA": "13",
            "RONDON": "15",
            "CIDADE GAUCHA": "16",
            "IVATE": "4",
            "RIO PARANA": "72",
            "TAPEJARA": "3",
            "MOREIRA SALES": "18"
        };

        if (campoFilial && campoUnidade) {
            campoFilial.addEventListener('change', () => {
                const filialSelecionada = campoFilial.value;

                // Define a unidade automaticamente com base no mapa acima
                campoUnidade.value = codigosUnidades[filialSelecionada] || "";

                if (inputFrota) inputFrota.value = "";
                if (inputDeposito) inputDeposito.value = "";
                if (inputCracha) inputCracha.value = "";
                if (inputNome) inputNome.value = "";
            });
        }

        if (inputFrota) {
            inputFrota.value = "";
            inputFrota.addEventListener('blur', async () => {
                const frota = inputFrota.value.trim();
                const filial = campoFilial.value;

                if (!frota) return;
                if (!filial) {
                    alert("Por favor, selecione a Filial primeiro.");
                    inputFrota.value = "";
                    return;
                }

                inputDeposito.value = "";
                inputDeposito.placeholder = "Buscando...";

                try {
                    const resposta = await fetch(URL_GOOGLE_SCRIPT, {
                        method: 'POST',
                        body: JSON.stringify({
                            acao: "verificarFrota",
                            filial: filial,
                            frota: frota
                        })
                    });
                    const dados = await resposta.json();

                    if (dados.status === "sucesso") {
                        inputDeposito.value = dados.deposito;
                        inputDeposito.placeholder = "";
                    } else {
                        inputDeposito.value = "";
                        inputDeposito.placeholder = "Ex: 20";
                        inputFrota.value = "";
                        alert(dados.mensagem);
                    }
                } catch (e) {
                    inputDeposito.value = "";
                    inputDeposito.placeholder = "Ex: 20";
                    alert("Erro ao validar a frota.");
                }
            });
        }

        if (inputCracha) {
            inputCracha.addEventListener('blur', async () => {
                const cracha = inputCracha.value.trim();
                const filial = campoFilial.value;

                if (!cracha) return;
                if (!filial) {
                    alert("Por favor, selecione a Filial primeiro.");
                    inputCracha.value = "";
                    return;
                }

                inputNome.value = "";
                inputNome.placeholder = "Buscando...";

                try {
                    const resposta = await fetch(URL_GOOGLE_SCRIPT, {
                        method: 'POST',
                        body: JSON.stringify({
                            acao: "verificarCracha",
                            filial: filial,
                            cracha: cracha
                        })
                    });
                    const dados = await resposta.json();

                    if (dados.status === "sucesso") {
                        inputNome.value = dados.nome;
                        inputNome.placeholder = "";
                    } else {
                        inputNome.value = "";
                        inputNome.placeholder = "NOME";
                        inputCracha.value = "";
                        alert(dados.mensagem);
                    }
                } catch (e) {
                    inputNome.value = "";
                    inputNome.placeholder = "NOME";
                    alert("Erro ao validar o crachá.");
                }
            });
        }

        if (btnEntrar) {
            btnEntrar.addEventListener('click', (e) => {
                e.preventDefault();

                if (!campoFilial.value || !inputFrota.value || !inputDeposito.value || !inputCracha.value || !inputNome.value) {
                    alert("Preencha todos os campos e aguarde a validação correta.");
                    return;
                }

                localStorage.setItem("dadosComboio", JSON.stringify({
                    filial: campoFilial.value,
                    unidade: campoUnidade.value,
                    frota: inputFrota.value,
                    deposito: inputDeposito.value,
                    cracha: inputCracha.value,
                    nome: inputNome.value
                }));

                btnEntrar.style.backgroundColor = "#2ecc71";
                btnEntrar.innerText = "ACESSANDO...";

                setTimeout(() => {
                    window.location.href = "painel.html";
                }, 1000);
            });
        }
    }
});