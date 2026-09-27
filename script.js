
    // Usando window.onload para garantir que tudo no HTML já foi carregado
    window.onload = function() {
        
        // ==========================================
        // 1. LÓGICA DA FILIAL E UNIDADE
        // ==========================================
        const campoFilial = document.getElementById('filial');
        const campoUnidade = document.getElementById('unidade');

        if (campoFilial && campoUnidade) {
            campoFilial.addEventListener('change', () => {
                campoUnidade.value = campoFilial.value;
            });
        }

        // ==========================================
        // 2. LÓGICA DAS BARRAS DE ESTOQUE E CORES
        // ==========================================
        const itensEstoque = document.querySelectorAll(".info-estoque-lista");

        itensEstoque.forEach(item => {
            const inputNumero = item.querySelector('input[type="number"]');
            const inputBarra = item.querySelector('input[type="range"]');
            const textoPorcentagem = item.querySelector('p');

            if (!inputNumero || !inputBarra) return;

            inputBarra.min = 0;
            inputBarra.max = 300;

            const atualizarStatus = () => {
                // Pega o número digitado
                let valor = parseInt(inputNumero.value) || 0;
                
                // Trava no máximo de 300 para o cálculo da barra
                if (valor > 300) valor = 300;

                inputBarra.value = valor;

                // Descobre a cor correta
                let cor = "";
                if (valor < 50) {
                    cor = "#e74c3c"; // Vermelho
                } else if (valor >= 50 && valor <= 150) {
                    cor = "#f39c12"; // Amarelo
                } else {
                    cor = "#2ecc71"; // Verde
                }

                // Calcula a porcentagem real
                let porcentagem = Math.round((valor / 300) * 100);

                // FORÇA A PINTURA DA BARRA (Resolve o bug de não atualizar)
                inputBarra.style.background = `linear-gradient(to right, ${cor} ${porcentagem}%, #e9ecef ${porcentagem}%)`;
                
                // Esconde a cor de destaque do CSS antigo para não dar conflito
                inputBarra.style.setProperty('--accent-color', 'transparent');

                // Atualiza o balão de porcentagem
                if (textoPorcentagem) {
                    textoPorcentagem.textContent = `${porcentagem}%`;
                    textoPorcentagem.style.color = cor;
                    textoPorcentagem.style.backgroundColor = `${cor}25`; // Fundo claro da mesma cor
                }
            };

            // Escuta cada vez que você digita ou apaga um número
            inputNumero.addEventListener("input", atualizarStatus);
            
            // Roda uma vez no início para deixar todas as barras zeradas
            atualizarStatus();
        });
    };

    // Localize o seu botão ENVIAR. Assumindo que ele está na classe .btn e é o primeiro botão
const botaoEnviar = document.querySelector('body > .btn button');

if (botaoEnviar) {
    botaoEnviar.addEventListener('click', (event) => {
        event.preventDefault(); // Evita que a página pisque ou recarregue

        // 1. Coleta os dados gerais de identificação
        const filial = document.getElementById('filial') ? document.getElementById('filial').value : 'Não informado';
        const deposito = document.getElementById('unidade') ? document.getElementById('unidade').value : 'Não informado';
        
        // Assumindo que você crie/tenha inputs com id="cracha" e id="equipamento"
        const cracha = document.getElementById('cracha') ? document.getElementById('cracha').value : 'Não informado';
        const equipamento = document.getElementById('equipamento') ? document.getElementById('equipamento').value : 'Não informado';

        // 2. Coleta os saldos de cada caminhão/produto individualmente
        const saldos = [];
        const linhasEstoque = document.querySelectorAll('.box-lista');

        linhasEstoque.forEach(linha => {
            // Pega o nome do produto ou caminhão (o primeiro label dentro de .lista)
            const nomeItem = linha.querySelector('.lista label').innerText;
            // Pega o valor digitado
            const litros = linha.querySelector('input[type="number"]').value || "0";

            saldos.push({
                item: nomeItem,
                litros: litros
            });
        });

        // 3. Empacota tudo em um objeto organizado
        const dadosParaEnvio = {
            identificacao: {
                filial: filial,
                deposito: deposito,
                cracha: cracha,
                equipamento: equipamento
            },
            estoque: saldos
        };

        // Imprime no painel de desenvolvedor (F12) para você ver a mágica acontecendo
        console.log("Pacote de dados capturado com sucesso:", dadosParaEnvio);

        // AQUI SUBSTITUÍMOS PELO CÓDIGO DE ENVIO ESCOLHIDO (Planilha, Webhook ou WhatsApp)
        alert("Dados capturados! Abra o console (F12) para visualizar.");
    });
}