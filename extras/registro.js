if (document.getElementById('registroTable')) {
    const storage = new StudentStorage();
    const toast = new Toast();

    document.addEventListener('DOMContentLoaded', () => {
        renderRegistros();
        populateStudentSelect();
    });

    function renderRegistros() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const students = storage.getAll();
        const table = document.getElementById('registroTable');

        const filtered = students.filter(s =>
            s.nome.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            table.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
            return;
        }

        table.innerHTML = filtered.map(student => `
            <tr>
                <td><strong>${student.nome}</strong></td>
                <td>${student.dataMatricula || '-'}</td>
                <td>${student.livroRegistro || '-'}</td>
                <td>${student.folhaRegistro || '-'}</td>
                <td>${student.dataEmissaoDiploma || '-'}</td>
                <td>${student.numeroRegistroDiploma || '-'}</td>
                <td class="text-right">
                    <button class="btn btn-outline" onclick="editRegistro('${student.id}')">✎</button>
                </td>
            </tr>
        `).join('');
    }

    function populateStudentSelect() {
        const students = storage.getAll();
        const select = document.getElementById('studentSelect');
        select.innerHTML = '<option value="">Selecione um aluno...</option>' +
            students.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
    }

    document.getElementById('searchInput').addEventListener('input', renderRegistros);

    document.getElementById('newRegistroBtn').addEventListener('click', () => {
        document.getElementById('registroForm').reset();
       // document.getElementById('anoIngresso').value = new Date().getFullYear();
        document.getElementById('registroModal').classList.add('active');
    });

    window.editRegistro = function(id) {
        const student = storage.getById(id);
        document.getElementById('studentSelect').value = id;
        document.getElementById('dataMatricula').value = student.dataMatricula || '';
        document.getElementById('livroRegistro').value = student.livroRegistro || '';
        document.getElementById('folhaRegistro').value = student.folhaRegistro || '';
        document.getElementById('dataEmissaoDiploma').value = student.dataEmissaoDiploma || '';
        document.getElementById('numeroRegistroDiploma').value = student.numeroRegistroDiploma || '';
        document.getElementById('observacoes').value = student.observacoes || '';
        document.getElementById('registroModal').classList.add('active');
    };

    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('registroModal').addEventListener('click', e => {
        if (e.target.id === 'registroModal') closeModal();
    });

    function closeModal() {
        document.getElementById('registroModal').classList.remove('active');
    }

    document.getElementById('registroForm').addEventListener('submit', e => {
        e.preventDefault();

        const studentId = document.getElementById('studentSelect').value;
        const student = storage.getById(studentId);

        if (!student) {
            toast.show('Selecione um aluno válido', 'error');
            return;
        }

        student.dataMatricula = document.getElementById('dataMatricula').value;
        student.livroRegistro = document.getElementById('livroRegistro').value;
        student.folhaRegistro = document.getElementById('folhaRegistro').value;
        student.dataEmissaoDiploma = document.getElementById('dataEmissaoDiploma').value;
        student.numeroRegistroDiploma = document.getElementById('numeroRegistroDiploma').value;
        student.observacoes = document.getElementById('observacoes').value;

        storage.save(student);
        closeModal();
        renderRegistros();
        toast.show('Registro atualizado com sucesso!', 'success');
    });
}
