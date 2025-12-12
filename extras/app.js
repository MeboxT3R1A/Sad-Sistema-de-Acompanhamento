// ========== STUDENT STORAGE ========== 
class StudentStorage {
    constructor() {
        this.key = 'students_data';
    }

    getAll() {
        if (typeof localStorage === 'undefined') return [];
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    save(student) {
        const students = this.getAll();
        const existingIndex = students.findIndex(s => s.id === student.id);

        if (existingIndex >= 0) {
            students[existingIndex] = student;
        } else {
            students.push(student);
        }

        localStorage.setItem(this.key, JSON.stringify(students));
    }

    delete(id) {
        const students = this.getAll().filter(s => s.id !== id);
        localStorage.setItem(this.key, JSON.stringify(students));
    }

    getById(id) {
        return this.getAll().find(s => s.id === id);
    }

    addSample() {
        const sample = {
            id: this.generateId(),
            nome: 'João Pedro Silva Santos',
            rg: '12.345.678-9',
            cpf: '123.456.789-00',
            dataNascimento: '2000-05-15',
            nomePai: 'Carlos Alberto Santos',
            nomeMae: 'Maria Helena Silva Santos',
            rgPai: '98.765.432-1',
            cpfPai: '987.654.321-00',
            rgMae: '11.222.333-4',
            cpfMae: '111.222.333-44',
            endereco: 'Rua das Flores, 123 - Centro - São Paulo/SP',
            telefone: '(11) 98765-4321',
            email: 'joao.santos@email.com',
            curso: 'Técnico em Informática',
            turma: 'TI-2024-A',
            turno: 'manha',
            anoIngresso: '2024',
            anoFormatura: '2026',
            status: 'ativo'
        };
        this.save(sample);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
if (document.getElementById('studentsTable')) {
    const storage = new StudentStorage();
    const toast = new Toast();
    let currentStudent = null;

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        const students = storage.getAll();
        if (students.length === 0) {
            storage.addSample();
        }
        renderStudents();
    });

    // Render students table
    function renderStudents() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const students = storage.getAll();
        const table = document.getElementById('studentsTable');

        const filtered = students.filter(s =>
            s.nome.toLowerCase().includes(searchTerm) ||
            s.cpf.includes(searchTerm) ||
            s.curso.toLowerCase().includes(searchTerm)
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

    // Search
    document.getElementById('searchInput').addEventListener('input', renderStudents);

    // New Student
    document.getElementById('newStudentBtn').addEventListener('click', openModal);

    // Edit Student
    window.editStudent = function(id) {
        currentStudent = storage.getById(id);
        document.getElementById('modalTitle').textContent = 'Editar Aluno';
        populateForm(currentStudent);
        document.getElementById('studentModal').classList.add('active');
    };

    // Delete Student
    window.deleteStudent = function(id) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            storage.delete(id);
            renderStudents();
            toast.show('Aluno excluído com sucesso!', 'success');
        }
    };

    // Open Modal
    function openModal() {
        currentStudent = null;
        document.getElementById('modalTitle').textContent = 'Novo Aluno';
        document.getElementById('studentForm').reset();
        document.getElementById('anoIngresso').value = new Date().getFullYear();
        document.getElementById('studentModal').classList.add('active');
    }

    // Close Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('studentModal').addEventListener('click', e => {
        if (e.target.id === 'studentModal') closeModal();
    });

    function closeModal() {
        document.getElementById('studentModal').classList.remove('active');
    }

    // Form Submit
    document.getElementById('studentForm').addEventListener('submit', e => {
        e.preventDefault();

        const student = {
            id: currentStudent?.id || storage.generateId(),
            nome: document.getElementById('nome').value,
            rg: document.getElementById('rg').value,
            cpf: document.getElementById('cpf').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            nomePai: document.getElementById('nomePai').value,
            nomeMae: document.getElementById('nomeMae').value,
            rgPai: document.getElementById('rgPai').value,
            cpfPai: document.getElementById('cpfPai').value,
            rgMae: document.getElementById('rgMae').value,
            cpfMae: document.getElementById('cpfMae').value,
            endereco: document.getElementById('endereco').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            curso: document.getElementById('curso').value,
            turma: document.getElementById('turma').value,
            turno: document.getElementById('turno').value,
            anoIngresso: document.getElementById('anoIngresso').value,
            anoFormatura: document.getElementById('anoFormatura').value,
            status: document.getElementById('status').value
        };

        storage.save(student);
        closeModal();
        renderStudents();
        toast.show('Aluno salvo com sucesso!', 'success');
    });

    // Populate form for editing
    function populateForm(student) {
        if (!student) return;
        document.getElementById('nome').value = student.nome;
        document.getElementById('rg').value = student.rg;
        document.getElementById('cpf').value = student.cpf;
        document.getElementById('dataNascimento').value = student.dataNascimento;
        document.getElementById('nomePai').value = student.nomePai || '';
        document.getElementById('nomeMae').value = student.nomeMae;
        document.getElementById('rgPai').value = student.rgPai || '';
        document.getElementById('cpfPai').value = student.cpfPai || '';
        document.getElementById('rgMae').value = student.rgMae || '';
        document.getElementById('cpfMae').value = student.cpfMae || '';
        document.getElementById('endereco').value = student.endereco;
        document.getElementById('telefone').value = student.telefone;
        document.getElementById('email').value = student.email || '';
        document.getElementById('curso').value = student.curso;
        document.getElementById('turma').value = student.turma;
        document.getElementById('turno').value = student.turno;
        document.getElementById('anoIngresso').value = student.anoIngresso;
        document.getElementById('anoFormatura').value = student.anoFormatura || '';
        document.getElementById('status').value = student.status;
    }
}
