if (document.getElementById('docsTable')) {
    
    let allStudents = [];
    let currentStudent = null;
    const toast = new Toast();

    document.addEventListener('DOMContentLoaded', () => {
        renderDocs();
    });

    async function renderDocs() {
        try {
            const response = await fetch('/api/documentos');
            allStudents = await response.json(); 
            
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const table = document.getElementById('docsTable');

            const filtered = allStudents.filter(s =>
                s.nome.toLowerCase().includes(searchTerm)
            );

            if (filtered.length === 0) {
                table.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
                return;
            }

            // ATENÇÃO: A ordem aqui deve bater exata com o <thead> do seu HTML
            // HTML: Aluno | Certidão | RG | CPF | Endereço | Foto | Histórico | Diploma | Ações
            table.innerHTML = filtered.map(student => `
                <tr>
                    <td><strong>${student.nome}</strong></td>
                    <td>${renderCheckmark(student.certidao)}</td>
                    <td>${renderCheckmark(student.rg)}</td>
                    <td>${renderCheckmark(student.cpf)}</td>
                    <td>${renderCheckmark(student.endereco)}</td>
                    <td>${renderCheckmark(student.foto)}</td>
                    <td>${renderCheckmark(student.historico)}</td>
                    <td>${renderCheckmark(student.diploma)}</td> 
                    <td class="text-right">
                        <button class="btn btn-outline" onclick="editDocuments('${student.id}')">✎</button>
                    </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error("Erro ao buscar documentos:", error);
            const table = document.getElementById('docsTable');
            table.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Erro ao carregar dados.</td></tr>';
        }
    }

    function renderCheckmark(value) {
        return value ? '<span class="checkmark">✓</span>' : '<span class="checkmark empty">-</span>';
    }

    document.getElementById('searchInput').addEventListener('input', renderDocs);

    window.editDocuments = function(id) {
        currentStudent = allStudents.find(s => s.id == id);
        
        if (!currentStudent) return;

        const select = document.getElementById('studentSelect');
        if (select) {
            select.innerHTML = `<option value="${currentStudent.id}">${currentStudent.nome}</option>`;
            select.value = currentStudent.id;
        }
        
        document.querySelectorAll('input[name="docs"]').forEach(cb => {
            cb.checked = currentStudent[cb.value] === true;
        });

        document.getElementById('docModal').classList.add('active');
    };

    document.getElementById('docForm').addEventListener('submit', async e => {
        e.preventDefault();
        if (!currentStudent) return;

        const dadosParaSalvar = {};
        document.querySelectorAll('input[name="docs"]').forEach(cb => {
            dadosParaSalvar[cb.value] = cb.checked;
        });

        try {
            const response = await fetch(`/api/documentos/${currentStudent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaSalvar)
            });

            if (response.ok) {
                toast.show('Documentos atualizados!', 'success');
                closeModal();
                renderDocs(); 
            } else {
                toast.show('Erro ao salvar.', 'error');
            }
            
        } catch (error) {
            console.error(error);
            toast.show('Erro de conexão.', 'error');
        }
    });

    // Funções do Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('docModal').addEventListener('click', e => {
        if (e.target.id === 'docModal') closeModal();
    });

    function closeModal() {
        document.getElementById('docModal').classList.remove('active');
    }
}