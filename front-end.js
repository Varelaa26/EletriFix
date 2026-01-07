function orçamento(){
    window.location.href = 'orcamento.html'
}

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('produto-form');
    const nomeInput = document.getElementById('nome-produto');
    const descInput = document.getElementById('descricao-produto');
    const precoInput = document.getElementById('preco-produto');
    const qtdInput = document.getElementById('quantidade-produto');
    const tbody = document.getElementById('produtos-body');
    const publicList = document.getElementById('produtos-list');

    let produtos = JSON.parse(localStorage.getItem('produtos') || '[]');

    function salvar() {
        localStorage.setItem('produtos', JSON.stringify(produtos));
    }

    function formatarPreco(valor) {
        return 'R$ ' + Number(valor).toFixed(2);
    }

    function desenharTabela() {
        if (!tbody) return;
        tbody.innerHTML = '';

        produtos.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.nome}</td>
                <td>${p.descricao}</td>
                <td>${formatarPreco(p.preco)}</td>
                <td>${p.quantidade}</td>
                <td>
                    <button class="remove" data-id="${p.id}">Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderPublicList() {
        if (!publicList) return;

        publicList.innerHTML = '';
        if (!produtos.length) {
            publicList.innerHTML = '<p>Nenhum produto cadastrado.</p>';
            return;
        }

        produtos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'produto-card';
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>${p.descricao}</p>
                <strong>${formatarPreco(p.preco)}</strong>
            `;
            publicList.appendChild(card);
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const novo = {
                id: Date.now(),
                nome: nomeInput.value.trim(),
                descricao: descInput.value.trim(),
                preco: parseFloat(precoInput.value),
                quantidade: parseInt(qtdInput.value)
            };

            produtos.unshift(novo);
            salvar();
            desenharTabela();
            form.reset();
        });
    }

    if (tbody) {
        tbody.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove')) {
                const id = Number(e.target.dataset.id);
                produtos = produtos.filter(p => p.id !== id);
                salvar();
                desenharTabela();
            }
        });
    }

    desenharTabela();
    renderPublicList();
});
