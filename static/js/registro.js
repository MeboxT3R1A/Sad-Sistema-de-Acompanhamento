if (document.getElementById('registroTable')) {
    const toast = new Toast();
    let registros = [];
    let alunoSelecionado = null;

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
                <td>${r.via  || '-'}</td>
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
            const res = await fetch('/api/alunos?per_page=1000');
            const data = await res.json();
            const alunos = data.alunos || [];

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
    // AO SELECIONAR ALUNO → CARREGAR DADOS
    // ======================
    document
        .getElementById('studentSelectRegistro')
        .addEventListener('change', async function () {

            const alunoId = this.value;
            if (!alunoId) return;

            try {
                const res = await fetch(`/api/alunos/${alunoId}`);
                if (!res.ok) throw new Error();

                const aluno = await res.json();

                // ===== DADOS BÁSICOS =====
                document.getElementById('cpfRegistro').value = aluno.cpf ?? '';
                document.getElementById('dataNascimentoRegistro').value = aluno.data_nascimento ?? '';
                document.getElementById('dataEspedicaoRegistro').value = aluno.data_expedicao ?? '';
                document.getElementById('nacionalidadeRegistro').value = aluno.nacionalidade ?? '';
                document.getElementById('naturalidadeRegistro').value = aluno.naturalidade ?? '';
                document.getElementById('ufRegistro').value = aluno.uf ?? '';
                document.getElementById('identidadeRegistro').value = aluno.identidade ?? '';
                document.getElementById('expedidorRegistro').value = aluno.expedidor ?? '';
                document.getElementById('dataEspedicaoRegistro').value =
                    aluno.data_expedicao
                        ? aluno.data_expedicao.split('T')[0]
                        : '';

                // ===== TURMAS / CURSOS =====
                const selectCurso = document.getElementById('studentRegistroSelect');

                selectCurso.innerHTML = '<option value="">Selecione uma turma...</option>';

                if (aluno.cursos && aluno.cursos.length > 0) {
                    aluno.cursos.forEach((c, index) => {
                        selectCurso.innerHTML += `
                            <option value="${index}">
                                ${c.curso} - ${c.turma}
                            </option>
                        `;
                    });
                }

            } catch (e) {
                toast.show('Erro ao carregar dados do aluno', 'error');
            }
        });



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
        document.getElementById('registroFolha').value = r.folha_registro|| '';
        document.getElementById('dataRegistroRegistro').value = r.data_registro || '';
        document.getElementById('numeroRegistroDiploma').value = r.numero_diploma || '';
        document.getElementById('numeroEmissaoDiploma').value = r.via || '';

        document.getElementById('registroModal').classList.add('active');
    };

    document.getElementById('closeModalBtn').onclick = fecharModal;
    document.getElementById('cancelBtn').onclick = fecharModal;

    function fecharModal() {
        document.getElementById('registroModal').classList.remove('active');
    }

    const imprimirBtn = document.getElementById('newImprimirBtn');
    const imprimirModal = document.getElementById('ImprimirModal');
    const closeImprimirBtn = document.getElementById('closeImprimirBtn');
    const cancelImprimirBtn = document.getElementById('cancelImprimirBtn');

    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', () => {
            imprimirModal.classList.add('active');
        });
    }

    function fecharImprimirModal() {
        imprimirModal.classList.remove('active');
    }

    if (closeImprimirBtn) {
        closeImprimirBtn.addEventListener('click', fecharImprimirModal);
    }

    if (cancelImprimirBtn) {
        cancelImprimirBtn.addEventListener('click', fecharImprimirModal);
    }

    imprimirModal.addEventListener('click', e => {
        if (e.target.id === 'ImprimirModal') {
            fecharImprimirModal();
        }
    });

    const searchInput = document.getElementById("searchAlunoImprimir");
    const lista = document.getElementById("listaAlunosImprimir");

    searchInput.addEventListener("input", async () => {
        const termo = searchInput.value.trim();

        if (termo.length < 2) {
            lista.innerHTML = "";
            return;
        }

        const res = await fetch(`/api/alunos?search=${encodeURIComponent(termo)}&per_page=5`);
        const data = await res.json();

        lista.innerHTML = "";

        data.alunos.forEach(aluno => {
            const div = document.createElement("div");
            div.className = "autocomplete-item";
            div.textContent = `${aluno.nome} — ${aluno.cpf}`;

            div.addEventListener("click", () => selecionarAluno(aluno.id, aluno.nome));

            lista.appendChild(div);
        });
    });

    async function selecionarAluno(alunoId, nome) {
        const res = await fetch(`/api/alunos/${alunoId}`);
        const aluno = await res.json();

        alunoSelecionado = aluno;

        searchInput.value = nome;
        lista.innerHTML = "";

        preencherCursos(aluno);
    }

    function preencherCursos(aluno) {
        const select = document.getElementById("studentImprimirSelect");
        select.innerHTML = `<option value="">Selecione um curso...</option>`;

        if (!aluno.cursos || aluno.cursos.length === 0) return;

        aluno.cursos.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.curso;
            opt.textContent = `${c.curso} — ${c.turma || ""}`;
            select.appendChild(opt);
        });
    }


    // ======================
    // SALVAR REGISTRO
    // ======================
    document.getElementById('registroForm').addEventListener('submit', async e => {
        e.preventDefault();

        const payload = {
            aluno_id: document.getElementById('studentSelectRegistro').value,
            livro: document.getElementById('livroRegistro').value,
            folha_registro: document.getElementById('registroFolha').value,
            data_registro: document.getElementById('dataRegistroRegistro').value,
            numero_diploma: document.getElementById('numeroRegistroDiploma').value,
            via: parseInt(document.getElementById('numeroEmissaoDiploma').value, 10),
            data_emissao: document.getElementById('dataEspedicaoRegistro').value
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
