let labelMensagemOrçamento = document.getElementById('labelMensagemOrçamento');
let mensagemOrçamento = document.getElementById('mensagemCopyOrçamento');

function gerarMensagemOrçamento(){
    
    let nome = document.querySelector('input[name="nome"]').value;
    let serviço = document.querySelector('select[name="servico"]').value; // Corrigido 'servico' (sem cedilha, igual ao HTML)
    let detalhes = document.querySelector('textarea[name="detalhes"]').value;
    let telefone = document.querySelector('input[name="telefone"]').value;
    
    let mensagem = `Olá, meu nome é ${nome}. Gostaria de solicitar um orçamento para o serviço de ${serviço}. Detalhes adicionais: ${detalhes}. Meu telefone para contato é ${telefone}.`;

    labelMensagemOrçamento.textContent = "Mensagem gerada, copie e cole no whatsapp +55 49 8868-6515:";
    mensagemOrçamento.textContent = mensagem;

    let cidade = document.getElementById('cidade').value;
    let bairro = document.getElementById('bairro').value;
    let rua = document.getElementById('rua').value;
    let numero = document.getElementById('numero').value;
    let complemento = document.getElementById('complemento').value;

    let localizacao = document.getElementsByClassName('localizacao')[0];
    localizacao.textContent = `Endereço: ${rua}, ${numero}, ${bairro}, ${cidade}. Complemento: ${complemento}.`;
}