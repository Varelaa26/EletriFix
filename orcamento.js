let labelMensagemOrçamento = document.getElementById('labelMensagemOrçamento');
let mensagemOrçamento = document.getElementById('mensagemCopyOrçamento');

function gerarMensagemOrçamento() {
    let nome = document.querySelector('input[name="nome"]').value;
    let serviço = document.querySelector('select[name="servico"]').value;
    let detalhes = document.querySelector('textarea[name="detalhes"]').value;
    let telefone = document.querySelector('input[name="telefone"]').value;
    
    // Captura de endereço
    let cidade = document.getElementById('cidade').value;
    let bairro = document.getElementById('bairro').value;
    let rua = document.getElementById('rua').value;
    let numero = document.getElementById('numero').value;
    let complemento = document.getElementById('complemento').value;

    let mensagem = `Olá, meu nome é ${nome}. Gostaria de solicitar um orçamento para o serviço de ${serviço}. \nDetalhes: ${detalhes}. \nEndereço: ${rua}, ${numero}, ${bairro}, ${cidade}. \nContato: ${telefone}.`;

    document.getElementById('labelMensagemOrçamento').textContent = "Mensagem gerada com sucesso! Envie a mensagem para o whatsapp +55 49 8868-6515, ou para o instagram @eletrifix66";
    document.getElementById('mensagemCopyOrçamento').textContent = mensagem;
    
    // Exibe o endereço formatado na tela se o elemento existir
    let localizacao = document.getElementsByClassName('localizacao')[0];
    if(localizacao) {
        localizacao.textContent = `Local: ${rua}, ${numero} - ${bairro}, ${cidade}.`;
    }
}

// Nova função de cópia moderna
async function copiarTexto() {
    const elemento = document.getElementById('mensagemCopyOrçamento');
    
    if (!elemento) {
        alert('Erro: elemento não encontrado');
        return;
    }
    
    // Usa textContent para elementos <p> e value para inputs
    const texto = elemento.textContent || elemento.value || '';
    
    // Remove espaços em branco e verifica se está vazio
    const textoLimpo = texto.trim();
    
    if (textoLimpo === '' || textoLimpo === 'Precencha o formulário para exibir a mensagem') {
        alert('Não há mensagem para copiar. Por favor, preencha o formulário e gere a mensagem primeiro.');
        return;
    }

    try {
        await navigator.clipboard.writeText(textoLimpo);
        alert('Mensagem copiada para a área de transferência!');
    } 
    catch (err) {
        const el = document.createElement('textarea');
        el.value = textoLimpo;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('Mensagem copiada!');
    }
}
