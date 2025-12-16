if (document.getElementById('registroTable')) {
    const toast = new Toast();
    let registros = [];

    document.addEventListener('DOMContentLoaded', () => {
        carregarRegistros();
        carregarAlunos();
    });

    // ======================
    // LISTAR REGISTROS
    // ======================
    async function carregarRegistros() {
        try {
            const res = await fetch('/api/registros');
            registros = await res.json();
            renderRegistros();
        } catch (e) {
            toast.show('Erro ao carregar registros', 'error');
        }
    }

    function renderRegistros() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const table = document.getElementById('registroTable');

        const filtrados = registros.filter(r =>
            r.aluno.toLowerCase().includes(searchTerm)
        );

        if (filtrados.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        Nenhum registro encontrado
                    </td>
                </tr>`;
            return;
        }

        table.innerHTML = filtrados.map(r => `
            <tr>
                <td><strong>${r.aluno}</strong></td>
                <td>${r.data_matricula || '-'}</td>
                <td>${r.livro || '-'}</td>
                <td>${r.folha_registro || '-'}</td>
                <td>${r.data_registro || '-'}</td>
                <td>${r.numero_diploma || '-'}</td>
                <td>${r.numero_emissoes || '-'}</td>
                <td class="text-right">
                    <button class="btn btn-outline" onclick="editarRegistro(${r.diploma_id})">✎</button>
                </td>
            </tr>
        `).join('');
    }

    document.getElementById('searchInput')
        .addEventListener('input', renderRegistros);

    // ======================
    // SELECT DE ALUNOS
    // ======================
    async function carregarAlunos() {
        const select = document.getElementById('studentSelectRegistro');
        try {
            const res = await fetch('/api/alunos');
            const alunos = await res.json();

            select.innerHTML =
                '<option value="">Selecione um aluno...</option>' +
                alunos.map(a =>
                    `<option value="${a.id}">${a.nome}</option>`
                ).join('');
        } catch {
            toast.show('Erro ao carregar alunos', 'error');
        }
    }

    // ======================
    // MODAL
    // ======================
    document.getElementById('newRegistroBtn').addEventListener('click', () => {
        document.getElementById('registroForm').reset();
        document.getElementById('registroModal').classList.add('active');
    });

    window.editarRegistro = function (id) {
        const r = registros.find(x => x.diploma_id === id);
        if (!r) return;

        document.getElementById('studentSelectRegistro').value = r.aluno_id;
        document.getElementById('livroRegistro').value = r.livro || '';
        document.getElementById('registroFolha').value = r.folha_registro || '';
        document.getElementById('dataRegistroRegistro').value = r.data_registro || '';
        document.getElementById('numeroRegistroDiploma').value = r.numero_diploma || '';
        document.getElementById('numeroEmissaoDiploma').value = r.numero_emissoes || '';

        document.getElementById('registroModal').classList.add('active');
    };

    document.getElementById('closeModalBtn').onclick = fecharModal;
    document.getElementById('cancelBtn').onclick = fecharModal;

    function fecharModal() {
        document.getElementById('registroModal').classList.remove('active');
    }

    // ======================
    // SALVAR REGISTRO
    // ======================
    document.getElementById('registroForm').addEventListener('submit', async e => {
        e.preventDefault();

        const payload = {
            aluno_id: document.getElementById('studentSelectRegistro').value,
            livro: document.getElementById('livroRegistro').value,
            registro_numero: document.getElementById('registroFolha').value,
            data_registro: document.getElementById('dataRegistroRegistro').value,
            numero_diploma: document.getElementById('numeroRegistroDiploma').value,
            via: document.getElementById('numeroEmissaoDiploma').value,
            data_emissao: document.getElementById('dataRegistroRegistro').value
        };

        try {
            const res = await fetch('/api/registros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error();

            toast.show('Registro salvo com sucesso', 'success');
            fecharModal();
            carregarRegistros();
        } catch {
            toast.show('Erro ao salvar registro', 'error');
        }
    });
}
