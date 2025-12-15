if (document.getElementById('docsTable')) {
    
    let allStudents = [];
    let currentStudent = null;
    const toast = new Toast();
    let paginationManager = null;

    document.addEventListener('DOMContentLoaded', async () => {
        initPagination();
        await renderDocs();
        setupEventListeners();
    });

    function initPagination() {
        paginationManager = new PaginationManager({
            containerId: 'documentosPagination',
            perPage: 10,
            onPageChange: (page, search) => {
                renderDocs(page, search);
            },
            onSearch: (search, page) => {
                renderDocs(page, search);
            }
        });
    }

    async function fetchDocs(page = 1, search = '') {
        try {
            let url = `/api/documentos?page=${page}&per_page=10`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Erro ao buscar documentos');
            }
            
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar documentos:", error);
            toast.show('Erro ao carregar documentos', 'error');
            return { documentos: [], pagination: {} };
        }
    }

    async function renderDocs(page = 1, search = '') {
        try {
            const data = await fetchDocs(page, search);
            allStudents = data.documentos || [];
            const pagination = data.pagination || {};
            
            const table = document.getElementById('docsTable');

            if (allStudents.length === 0) {
                table.innerHTML = '<tr><td colspan="10" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
            } else {
                table.innerHTML = allStudents.map(student => `
                    <tr>
                        <td><strong>${student.nome}</strong></td>
                        <td>${student.turma || '-'}</td>
                        <td class="text-center">${renderCheckmark(student.certidao_entregue)}</td>
                        <td class="text-center">${renderCheckmark(student.rg_entregue)}</td>
                        <td class="text-center">${renderCheckmark(student.cpf_entregue)}</td>
                        <td class="text-center">${renderCheckmark(student.endereco_entregue)}</td>
                        <td class="text-center">${renderCheckmark(student.foto_entregue)}</td>
                        <td class="text-center">${renderCheckmark(student.historico_entregue)}</td>
                        <td class="text-center">${renderCheckmark(student.diploma_entregue)}</td>
                        <td class="text-right">
                            <button class="btn btn-outline" onclick="editDocuments('${student.id}')">✎</button>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Atualizar paginação
            if (paginationManager) {
                paginationManager.update(pagination);
            }
            
        } catch (error) {
            console.error("Erro ao renderizar documentos:", error);
            const table = document.getElementById('docsTable');
            table.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Erro ao carregar dados.</td></tr>';
        }
    }

    function renderCheckmark(value) {
        return value 
            ? '<span class="checkmark">✓</span>' 
            : '<span class="checkmark empty">-</span>';
    }

    function setupEventListeners() {
        // Fechar modal
        document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
        document.getElementById('cancelBtn')?.addEventListener('click', closeModal);
        
        // Fechar modal ao clicar fora
        document.getElementById('docModal')?.addEventListener('click', e => {
            if (e.target.id === 'docModal') closeModal();
        });
        
        // Submit form
        document.getElementById('docForm')?.addEventListener('submit', handleFormSubmit);
    }

    window.editDocuments = async function(id) {
        try {
            currentStudent = allStudents.find(s => s.id == id);
            
            if (!currentStudent) {
                toast.show('Aluno não encontrado', 'error');
                return;
            }

            // Carregar alunos para o select
            await loadStudentsForSelect();
            
            // Preencher o formulário
            const select = document.getElementById('studentSelect');
            if (select) {
                select.value = currentStudent.id;
            }
            
            const turmaInput = document.getElementById('turmaInput');
            if (turmaInput) {
                turmaInput.value = currentStudent.turma || '';
            }
            
            // Atualizar checkboxes de documentos
            document.querySelectorAll('input[name="docs"]').forEach(cb => {
                const fieldMap = {
                    'certidao': 'certidao_entregue',
                    'rg': 'rg_entregue',
                    'cpf': 'cpf_entregue',
                    'endereco': 'endereco_entregue',
                    'foto': 'foto_entregue',
                    'historico': 'historico_entregue',
                    'certificado': 'certificado_entregue',
                    'diploma': 'diploma_entregue'
                };
                
                if (fieldMap[cb.value]) {
                    cb.checked = currentStudent[fieldMap[cb.value]] === true;
                }
            });

            document.getElementById('docModal').classList.add('active');
        } catch (error) {
            console.error('Erro ao editar documentos:', error);
            toast.show('Erro ao abrir editor de documentos', 'error');
        }
    };

    async function loadStudentsForSelect() {
        try {
            const response = await fetch('/api/alunos?per_page=100'); // Limite maior para select
            const data = await response.json();
            const students = data.alunos || [];
            const select = document.getElementById('studentSelect');
            
            if (students.length > 0) {
                let options = '<option value="">Selecione um aluno...</option>';
                students.forEach(student => {
                    options += `<option value="${student.id}">${student.nome} - ${student.turma || ''}</option>`;
                });
                select.innerHTML = options;
            }
        } catch (error) {
            console.error('Erro ao carregar alunos para select:', error);
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        if (!currentStudent) {
            toast.show('Selecione um aluno primeiro', 'error');
            return;
        }

        const dadosParaSalvar = {};
        document.querySelectorAll('input[name="docs"]').forEach(cb => {
            const fieldMap = {
                'certidao': 'certidao',
                'rg': 'rg',
                'cpf': 'cpf',
                'endereco': 'endereco',
                'foto': 'foto',
                'historico': 'historico',
                'certificado': 'certificado',
                'diploma': 'diploma'
            };
            
            if (fieldMap[cb.value]) {
                dadosParaSalvar[fieldMap[cb.value]] = cb.checked;
            }
        });

        try {
            const response = await fetch(`/api/documentos/${currentStudent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaSalvar)
            });

            if (response.ok) {
                toast.show('Documentos atualizados com sucesso!', 'success');
                closeModal();
                await renderDocs(paginationManager.currentPage, paginationManager.currentSearch);
            } else {
                const error = await response.json().catch(() => ({}));
                toast.show(error.erro || 'Erro ao salvar documentos', 'error');
            }
            
        } catch (error) {
            console.error(error);
            toast.show('Erro de conexão com o servidor', 'error');
        }
    }

    function closeModal() {
        document.getElementById('docModal').classList.remove('active');
        currentStudent = null;
    }
}