function orçamento(){
    window.location.href = 'orcamento.html'
}

document.addEventListener('DOMContentLoaded', () => {

    // Detectar se está rodando no Live Server e usar a URL completa da API
    const isLiveServer = window.location.port === '5501' || window.location.port === '5500';
    const API_URL = isLiveServer ? 'http://localhost:3000/api/produtos' : '/api/produtos';

    const form = document.getElementById('produto-form');
    const nomeInput = document.getElementById('nome-produto');
    const descInput = document.getElementById('descricao-produto');
    const precoInput = document.getElementById('preco-produto');
    const qtdInput = document.getElementById('quantidade-produto');
    const tbody = document.getElementById('produtos-body');
    const publicList = document.getElementById('produtos-list');

    let editandoId = null;

    /* =======================
       VALIDAÇÃO
    ======================= */
    function validarCampos() {
        if (!nomeInput || !nomeInput.value.trim()) {
            alert('Nome do produto é obrigatório');
            return false;
        }
        if (!precoInput || precoInput.value <= 0) {
            alert('Preço deve ser maior que zero');
            return false;
        }
        if (!qtdInput || qtdInput.value < 0) {
            alert('Quantidade não pode ser negativa');
            return false;
        }
        return true;
    }

    function formatarPreco(valor) {
        return 'R$ ' + Number(valor).toFixed(2);
    }

    /* =======================
       FORNECEDOR (CRUD)
    ======================= */
    async function carregarTabela() {
        if (!tbody) return;

        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                console.error('Erro ao carregar produtos:', res.status);
                return;
            }
            const produtos = await res.json();

            tbody.innerHTML = '';

            produtos.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.nome}</td>
                    <td>${p.descricao}</td>
                    <td>${formatarPreco(p.preco)}</td>
                    <td>${p.quantidade}</td>
                    <td>
                        <button class="editar" data-id="${p.id}">Editar</button>
                        <button class="remover" data-id="${p.id}">Remover</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Erro ao carregar tabela:', error);
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validarCampos()) return;

            const produto = {
                nome: nomeInput.value.trim(),
                descricao: descInput.value.trim(),
                preco: parseFloat(precoInput.value),
                quantidade: parseInt(qtdInput.value),
                imagem: ''
            };

            try {
                let response;
                if (editandoId) {
                    response = await fetch(`${API_URL}/${editandoId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(produto)
                    });
                    editandoId = null;
                } else {
                    response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(produto)
                    });
                }

                if (!response.ok) {
                    alert('Erro ao salvar produto. Verifique o console para mais detalhes.');
                    console.error('Erro na resposta:', response.status, await response.text());
                    return;
                }

                form.reset();
                await carregarTabela();
                await carregarProdutosPublicos();
            } catch (error) {
                alert('Erro ao salvar produto: ' + error.message);
                console.error('Erro:', error);
            }
        });
    }

    if (tbody) {
        tbody.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;

            if (e.target.classList.contains('remover')) {
                if (confirm('Deseja remover este produto?')) {
                    try {
                        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                        if (!response.ok) {
                            alert('Erro ao remover produto.');
                            return;
                        }
                        await carregarTabela();
                        await carregarProdutosPublicos();
                    } catch (error) {
                        alert('Erro ao remover produto: ' + error.message);
                        console.error('Erro:', error);
                    }
                }
            }

            if (e.target.classList.contains('editar')) {
                const res = await fetch(API_URL);
                const produtos = await res.json();
                const produto = produtos.find(p => p.id == id);

                nomeInput.value = produto.nome;
                descInput.value = produto.descricao;
                precoInput.value = produto.preco;
                qtdInput.value = produto.quantidade;

                editandoId = produto.id;
            }
        });
    }

    /* =======================
       PÁGINA PÚBLICA (produtos.html)
    ======================= */
    async function carregarProdutosPublicos() {
        if (!publicList) return;

        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                console.error('Erro ao carregar produtos públicos:', res.status);
                return;
            }
            const produtos = await res.json();

            publicList.innerHTML = '';

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
        } catch (error) {
            console.error('Erro ao carregar produtos públicos:', error);
        }
    }

    carregarTabela();
    carregarProdutosPublicos();

    // Recarregar produtos públicos quando a página receber foco (útil quando há múltiplas abas)
    if (publicList) {
        window.addEventListener('focus', () => {
            carregarProdutosPublicos();
        });
        
        // Também recarregar quando a página ficar visível novamente
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                carregarProdutosPublicos();
            }
        });
    }
});
