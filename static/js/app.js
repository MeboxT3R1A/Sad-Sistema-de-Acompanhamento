// === 0. Campos defaults (temporário) ===
const DEFAULT_FIELDS = {
    rg: '',
    dataNascimento: '',
    nomePai: '',
    nomeMae: '',
    rgPai: '',
    cpfPai: '',
    rgMae: '',
    cpfMae: '',
    endereco: '',
    turno: '',
    anoIngresso: '',
    anoFormatura: '',
    status: 'ativo'
};

function normalizeStudent(raw) {
    return {
        ...DEFAULT_FIELDS,
        ...raw
    };
}

// ========== TOAST NOTIFICATIONS ========== 
class Toast {
    show(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ========== ALUNOS PAGE LOGIC ==========
if (document.getElementById('studentsTable')) {

    const toast = new Toast();
    let currentStudent = null;
    let paginationManager = null;

    document.addEventListener('DOMContentLoaded', async () => {
        initPagination();
        await renderStudents();
        setupEventListeners();
    });

    function initPagination() {
        paginationManager = new PaginationManager({
            containerId: 'alunosPagination',
            perPage: 15,
            onPageChange: (page, search) => {
                renderStudents(page, search);
            },
            onSearch: (search, page) => {
                renderStudents(page, search);
            }
        });
    }

    // Buscar alunos da API com paginação
    async function fetchStudents(page = 1, search = '') {
        try {
            let url = `/api/alunos?page=${page}&per_page=15`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Erro ao buscar alunos');
            }
            return await res.json();
        } catch (err) {
            console.error('Fetch /api/alunos falhou:', err);
            toast.show('Erro ao carregar alunos', 'error');
            return { alunos: [], pagination: {} };
        }
    }

    // Buscar aluno específico
    async function fetchStudentById(id) {
        try {
            const res = await fetch(`/api/alunos/${id}`);
            if (!res.ok) {
                throw new Error('Aluno não encontrado');
            }
            return await res.json();
        } catch (err) {
            console.error('Erro ao buscar aluno:', err);
            toast.show('Erro ao carregar dados do aluno', 'error');
            return null;
        }
    }

    // Criar aluno
    async function apiCreateStudent(student) {
        try {
            const res = await fetch('/api/alunos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({ erro: 'Erro desconhecido' }));
                throw new Error(err.erro || 'Falha ao criar aluno');
            }
            
            return await res.json();
        } catch (err) {
            console.error('Erro ao criar aluno:', err);
            toast.show(err.message || 'Erro ao criar aluno', 'error');
            throw err;
        }
    }

    // Atualizar aluno
    async function apiUpdateStudent(id, student) {
        try {
            const res = await fetch(`/api/alunos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(student)
            });
            
            if (!res.ok) {
                const err = await res.json().catch(() => ({ erro: 'Erro desconhecido' }));
                throw new Error(err.erro || 'Falha ao atualizar aluno');
            }
            
            return await res.json();
        } catch (err) {
            console.error('Erro ao atualizar aluno:', err);
            toast.show(err.message || 'Erro ao atualizar aluno', 'error');
            throw err;
        }
    }

    // Excluir aluno
    async function apiDeleteStudent(id) {
        try {
            const res = await fetch(`/api/alunos/${id}`, { 
                method: 'DELETE' 
            });
            
            if (!res.ok) {
                throw new Error('Falha ao excluir aluno');
            }
            
            return await res.json();
        } catch (err) {
            console.error('Erro ao excluir aluno:', err);
            toast.show('Erro ao excluir aluno', 'error');
            throw err;
        }
    }

    // Render tabela
    async function renderStudents(page = 1, search = '') {
        try {
            const data = await fetchStudents(page, search);
            const students = data.alunos || [];
            const pagination = data.pagination || {};
            
            const table = document.getElementById('studentsTable');
            
            // Renderizar alunos
            if (students.length === 0) {
                table.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
            } else {
                table.innerHTML = students.map(student => `
                    <tr>
                        <td><strong>${student.nome || ''}</strong></td>
                        <td>${student.cpf || ''}</td>
                        <td>${student.curso || ''}</td>
                        <td>${student.turma || ''}</td>
                        <td>
                            <span class="badge ${getStatusBadgeClass(student.status)}">
                                ${getStatusText(student.status)}
                            </span>
                        </td>
                        <td class="text-right">
                            <button class="btn btn-outline" onclick="editStudent('${student.id}')" style="margin-right: 8px;">✎</button>
                            <button class="btn btn-danger" onclick="deleteStudent('${student.id}')">🗑</button>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Atualizar paginação
            if (paginationManager) {
                paginationManager.update(pagination);
            }
            
        } catch (err) {
            console.error('Erro ao renderizar alunos:', err);
            const table = document.getElementById('studentsTable');
            table.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Erro ao carregar alunos</td></tr>';
        }
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'ativo': return 'badge-success';
            case 'concluido': return 'badge-info';
            case 'evadido': return 'badge-warning';
            default: return 'badge-info';
        }
    }

    function getStatusText(status) {
        switch (status) {
            case 'ativo': return 'Ativo';
            case 'concluido': return 'Concluído';
            case 'evadido': return 'Evadido';
            default: return 'Desconhecido';
        }
    }

    // Configurar listeners
    function setupEventListeners() {
        // Novo aluno
        document.getElementById('newStudentBtn').addEventListener('click', () => {
            currentStudent = null;
            document.getElementById('modalTitle').textContent = 'Novo Aluno';
            document.getElementById('studentForm').reset();
            document.getElementById('anoIngresso').value = new Date().getFullYear();
            document.getElementById('dataMatricula').valueAsDate = new Date();
            document.getElementById('studentModal').classList.add('active');
        });
        
        // Fechar modal
        document.getElementById('closeModalBtn').addEventListener('click', closeModal);
        document.getElementById('cancelBtn').addEventListener('click', closeModal);
        document.getElementById('studentModal').addEventListener('click', e => {
            if (e.target.id === 'studentModal') closeModal();
        });
        
        // Submit form
        document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    }

    // Editar aluno
    window.editStudent = async function (id) {
        try {
            const student = await fetchStudentById(id);
            if (!student) return;
            
            currentStudent = student;
            document.getElementById('modalTitle').textContent = 'Editar Aluno';
            populateForm(currentStudent);
            document.getElementById('studentModal').classList.add('active');
        } catch (err) {
            console.error('Erro ao editar aluno:', err);
        }
    };

    // Deletar aluno
    window.deleteStudent = async function (id) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            try {
                await apiDeleteStudent(id);
                await renderStudents(paginationManager.currentPage, paginationManager.currentSearch);
                toast.show('Aluno excluído com sucesso!', 'success');
            } catch (err) {
                console.error('Erro ao excluir aluno:', err);
            }
        }
    };

    // Fechar modal
    function closeModal() {
        document.getElementById('studentModal').classList.remove('active');
        currentStudent = null;
    }

    // Submit form
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Coletar dados do formulário
        const studentData = {
            nome: document.getElementById('nome').value,
            rg: document.getElementById('rg').value,
            cpf: document.getElementById('cpf').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            nomePai: document.getElementById('nomePai').value,
            nomeMae: document.getElementById('nomeMae').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            nacionalidade: document.getElementById('nacionalidade').value,
            naturalidade: document.getElementById('naturalidade').value,
            uf: document.getElementById('uf').value,
            expedidor: document.getElementById('expedidor').value,
            dataExpedicao: document.getElementById('dataExpedicao').value,
            endereco: document.getElementById('endereco').value,
            curso: document.getElementById('curso').value,
            turma: document.getElementById('turma').value,
            turno: document.getElementById('turno').value,
            anoIngresso: document.getElementById('anoIngresso').value,
            anoFormatura: document.getElementById('anoFormatura').value,
            dataMatricula: document.getElementById('dataMatricula').value,
            status: document.getElementById('status').value
        };

        try {
            if (currentStudent) {
                await apiUpdateStudent(currentStudent.id, studentData);
                toast.show('Aluno atualizado com sucesso!', 'success');
            } else {
                await apiCreateStudent(studentData);
                toast.show('Aluno criado com sucesso!', 'success');
            }

            closeModal();
            await renderStudents(paginationManager.currentPage, paginationManager.currentSearch);
        } catch (err) {
            console.error('Erro ao salvar aluno:', err);
        }
    }

    // Preencher form
    function populateForm(student) {
        document.getElementById('nome').value = student.nome || '';
        document.getElementById('rg').value = student.identidade || student.rg || '';
        document.getElementById('cpf').value = student.cpf || '';
        document.getElementById('dataNascimento').value = student.data_nascimento || student.dataNascimento || '';
        document.getElementById('nomePai').value = student.nomePai || '';
        document.getElementById('nomeMae').value = student.nomeMae || '';
        document.getElementById('telefone').value = student.telefone || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('nacionalidade').value = student.nacionalidade || '';
        document.getElementById('naturalidade').value = student.naturalidade || '';
        document.getElementById('uf').value = student.uf || '';
        document.getElementById('expedidor').value = student.expedidor || '';
        document.getElementById('dataExpedicao').value = student.data_expedicao || student.dataExpedicao || '';
        document.getElementById('endereco').value = student.endereco || '';
        document.getElementById('curso').value = student.curso || '';
        document.getElementById('turma').value = student.turma || '';
        document.getElementById('turno').value = student.turno || '';
        document.getElementById('anoIngresso').value = student.anoIngresso || '';
        document.getElementById('anoFormatura').value = student.anoFormatura || '';
        document.getElementById('dataMatricula').value = student.data_conclusao || student.dataMatricula || '';
        document.getElementById('status').value = student.status || 'ativo';
    }
}