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
    // Garante que todos os campos que o frontend espera existam
    return {
        ...DEFAULT_FIELDS,
        ...raw
    };
}

// === 1. Função para buscar alunos da API ===
async function getStudents() {
    try {
        const res = await fetch('/api/alunos');
        if (!res.ok) {
            console.error('Erro ao buscar alunos:', res.status, await res.text());
            return [];
        }
        const data = await res.json();
        // Normaliza cada registro para não quebrar o frontend
        return Array.isArray(data) ? data.map(normalizeStudent) : [];
    } catch (err) {
        console.error('Fetch /api/alunos falhou:', err);
        return [];
    }
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

// ========== MAIN PAGE LOGIC ========== 
// ========== MAIN PAGE LOGIC ==========
if (document.getElementById('studentsTable')) {

    const toast = new Toast();
    let currentStudent = null;

    document.addEventListener('DOMContentLoaded', async () => {
        await renderStudents();
    });

    // Buscar alunos da API
    async function fetchStudents() {
        const res = await fetch('/api/alunos');
        return await res.json();
    }

    // Buscar aluno específico
    async function fetchStudentById(id) {
        const res = await fetch(`/api/alunos/${id}`);
        return await res.json();
    }

    // Criar aluno
    async function apiCreateStudent(student) {
        await fetch('/api/alunos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
    }

    // Atualizar aluno
    async function apiUpdateStudent(id, student) {
        await fetch(`/api/alunos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
    }

    // Excluir aluno
    async function apiDeleteStudent(id) {
        await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
    }

    // Render tabela
    async function renderStudents() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const students = await fetchStudents();
        const table = document.getElementById('studentsTable');
        console.log("STUDENTS RAW:", students);
        const filtered = students.filter(s =>
            s.nome?.toLowerCase().includes(searchTerm) ||
            s.cpf?.includes(searchTerm) ||
            s.curso?.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            table.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
            return;
        }

        table.innerHTML = filtered.map(student => `
            <tr>
                <td><strong>${student.nome}</strong></td>
                <td>${student.cpf}</td>
                <td>${student.curso}</td>
                <td>${student.turma}</td>
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

    document.getElementById('searchInput').addEventListener('input', renderStudents);

    // Novo aluno
    document.getElementById('newStudentBtn').addEventListener('click', () => {
        currentStudent = null;
        document.getElementById('modalTitle').textContent = 'Novo Aluno';
        document.getElementById('studentForm').reset();
        document.getElementById('anoIngresso').value = new Date().getFullYear();
        document.getElementById('studentModal').classList.add('active');
    });

    // Editar aluno
    window.editStudent = async function (id) {
        currentStudent = await fetchStudentById(id);
        document.getElementById('modalTitle').textContent = 'Editar Aluno';
        populateForm(currentStudent);
        document.getElementById('studentModal').classList.add('active');
    };

    // Deletar aluno
    window.deleteStudent = async function (id) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            await apiDeleteStudent(id);
            await renderStudents();
            toast.show('Aluno excluído com sucesso!', 'success');
        }
    };

    // Fechar modal
    function closeModal() {
        document.getElementById('studentModal').classList.remove('active');
    }
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    document.getElementById('studentModal').addEventListener('click', e => {
        if (e.target.id === 'studentModal') closeModal();
    });

    // Submit form
    document.getElementById('studentForm').addEventListener('submit', async e => {
        e.preventDefault();

        const student = {
            nome: document.getElementById('nome').value,
            rg: document.getElementById('rg').value || '---',
            cpf: document.getElementById('cpf').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            nomePai: document.getElementById('nomePai').value || 'Não informado',
            nomeMae: document.getElementById('nomeMae').value || 'Não informado',
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value || 'sem-email@naoinformado.com',
            curso: document.getElementById('curso').value,
            turma: document.getElementById('turma').value,
            turno: document.getElementById('turno').value,
            anoIngresso: document.getElementById('anoIngresso').value,
            anoFormatura: document.getElementById('anoFormatura').value || '',
            status: document.getElementById('status').value
        };

        if (currentStudent) {
            await apiUpdateStudent(currentStudent.id, student);
        } else {
            await apiCreateStudent(student);
        }

        closeModal();
        await renderStudents();
        toast.show('Aluno salvo com sucesso!', 'success');
    });

    // Preencher form
    function populateForm(student) {
        document.getElementById('nome').value = student.nome;
        document.getElementById('rg').value = student.rg;
        document.getElementById('cpf').value = student.cpf;
        document.getElementById('dataNascimento').value = student.data_nascimento || student.dataNascimento;
        document.getElementById('nomePai').value = student.nomePai || '';
        document.getElementById('nomeMae').value = student.nomeMae || '';
        document.getElementById('telefone').value = student.telefone;
        document.getElementById('email').value = student.email;
        document.getElementById('curso').value = student.curso;
        document.getElementById('turma').value = student.turma;
        document.getElementById('turno').value = student.turno;
        document.getElementById('anoIngresso').value = student.anoIngresso;
        document.getElementById('anoFormatura').value = student.anoFormatura;
        document.getElementById('status').value = student.status;
    }
}
