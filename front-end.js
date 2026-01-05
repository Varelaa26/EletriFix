// Gerencia produtos usando localStorage (mesma funcionalidade, código mais claro)

function orçamento(){
    window.location.href = "orçamento.html";
}

document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    var nomeInput = document.getElementById('nome-produto');
    var descInput = document.getElementById('descricao-produto');
    var precoInput = document.getElementById('preco-produto');
    var qtdInput = document.getElementById('quantidade-produto');
    var tbody = document.getElementById('produtos-body');
    var publicList = document.getElementById('produtos-list');

    // Carrega a lista de produtos do localStorage (ou cria lista vazia)
    var produtos = JSON.parse(localStorage.getItem('produtos') || '[]');

    // Tenta sincronizar com o servidor; se falhar, continua usando localStorage
    function carregarDoServidor() {
        return fetch('/api/produtos')
            .then(function(res) {
                if (!res.ok) throw new Error('Resposta não OK');
                return res.json();
            })
            .then(function(data) {
                produtos = data;
                salvar();
                desenharTabela();
            })
            .catch(function() {
                // sem servidor disponível; manter localStorage
                desenharTabela();
            });
    }

    // Salva a lista no localStorage
    function salvar() {
        localStorage.setItem('produtos', JSON.stringify(produtos));
    }

    // Formata o preço para exibição
    function formatarPreco(valor) {
        return 'R$ ' + Number(valor).toFixed(2);
    }

    // Desenha a tabela de produtos na página do fornecedor (se existir)
    function desenharTabela() {
        if (!tbody) return;
        tbody.innerHTML = '';
        for (var i = 0; i < produtos.length; i++) {
            var p = produtos[i];
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + p.nome + '</td>' +
                '<td>' + p.descricao + '</td>' +
                '<td>' + formatarPreco(p.preco) + '</td>' +
                '<td>' + p.quantidade + '</td>' +
                '<td>' +
                    '<button data-id="' + p.id + '" class="edit">Editar</button> ' +
                    '<button data-id="' + p.id + '" class="remove">Remover</button>' +
                '</td>';
            tbody.appendChild(tr);
        }
    }

    // Renderiza a listagem pública em produtos.html
    function renderPublicList() {
        if (!publicList) return;
        publicList.innerHTML = '';
        if (!produtos || produtos.length === 0) {
            publicList.innerHTML = '<p>Nenhum produto cadastrado.</p>';
            return;
        }
        var ul = document.createElement('div');
        ul.className = 'produtos-grid';
        for (var i = 0; i < produtos.length; i++) {
            var p = produtos[i];
            var card = document.createElement('div');
            card.className = 'produto-card';
            card.innerHTML = '<h3>' + p.nome + '</h3>' +
                '<p>' + p.descricao + '</p>' +
                '<p><strong>' + formatarPreco(p.preco) + '</strong></p>' +
                '<p>Quantidade: ' + p.quantidade + '</p>';
            ul.appendChild(card);
        }
        publicList.appendChild(ul);
    }

    // Quando o formulário é enviado, cria um novo produto (apenas se o form existir)
    if (form) {
        form.addEventListener('submit', function(e) {
        e.preventDefault();
        var payload = {
            nome: nomeInput.value.trim(),
            descricao: descInput.value.trim(),
            preco: parseFloat(precoInput.value) || 0,
            quantidade: parseInt(qtdInput.value) || 0,
            imagem: null
        };

        // Tenta enviar ao servidor; se falhar, salva localmente
        fetch('/api/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(function(res) {
                if (!res.ok) throw new Error('Erro ao criar no servidor');
                return res.json();
            })
            .then(function(created) {
                produtos.unshift(created);
                salvar();
                desenharTabela();
                form.reset();
            })
            .catch(function() {
                // fallback: adicionar localmente com id temporário
                var novo = Object.assign({ id: Date.now() }, payload);
                produtos.unshift(novo);
                salvar();
                desenharTabela();
                form.reset();
            });
        });
    }

    // Usa delegação de eventos para os botões da tabela (se existir tabela)
    if (tbody) {
        tbody.addEventListener('click', function(e) {
        var target = e.target;
        var id = Number(target.getAttribute('data-id'));

        if (target.classList.contains('remove')) {
            if (confirm('Remover este produto?')) {
                // tenta remover no servidor, mas remove localmente sempre
                fetch('/api/produtos/' + id, { method: 'DELETE' })
                    .catch(function() { /* ignorar erro de rede */ });

                produtos = produtos.filter(function(item) { return item.id !== id; });
                salvar();
                desenharTabela();
            }
            return;
        }

        if (target.classList.contains('edit')) {
            var p = produtos.find(function(item) { return item.id === id; });
            if (!p) return;

            var novoNome = prompt('Nome do produto:', p.nome);
            if (novoNome === null) return;
            var novaDesc = prompt('Descrição:', p.descricao);
            if (novaDesc === null) return;
            var novoPreco = prompt('Preço:', p.preco);
            if (novoPreco === null) return;
            var novaQtd = prompt('Quantidade:', p.quantidade);
            if (novaQtd === null) return;

            p.nome = novoNome.trim();
            p.descricao = novaDesc.trim();
            p.preco = parseFloat(novoPreco) || p.preco;
            p.quantidade = parseInt(novaQtd) || p.quantidade;
            // tenta atualizar no servidor; se falhar, atualiza apenas localmente
            fetch('/api/produtos/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            })
                .then(function(res) {
                    if (!res.ok) throw new Error('Erro ao atualizar');
                    return res.json();
                })
                .then(function(updated) {
                    // substituir local com dados do servidor (opcional)
                    var idx = produtos.findIndex(function(item) { return item.id === updated.id; });
                    if (idx !== -1) produtos[idx] = updated;
                    salvar();
                    desenharTabela();
                })
                .catch(function() {
                    salvar();
                    desenharTabela();
                });
        }
        });
    }

    // Ao carregar, tenta sincronizar com servidor primeiro
    carregarDoServidor().then(function() {
        desenharTabela();
        renderPublicList();
    });
});
// fim
