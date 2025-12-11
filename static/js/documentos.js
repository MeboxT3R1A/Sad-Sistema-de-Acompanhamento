if (document.getElementById('docsTable')) {
    const storage = new StudentStorage();
    const toast = new Toast();
    let currentStudent = null;

    document.addEventListener('DOMContentLoaded', () => {
        renderDocs();
        populateStudentSelect();
    });

    function renderDocs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const students = storage.getAll();
        const table = document.getElementById('docsTable');

        const filtered = students.filter(s =>
            s.nome.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            table.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
            return;
        }

        table.innerHTML = filtered.map(student => `
            <tr>
                <td><strong>${student.nome}</strong></td>
                <td>${renderCheckmark(student.certidao)}</td>
                <td>${renderCheckmark(student.rg)}</td>
                <td>${renderCheckmark(student.cpf)}</td>
                <td>${renderCheckmark(student.endereco)}</td>
                <td>${renderCheckmark(student.foto)}</td>
                <td>${renderCheckmark(student.historico)}</td>
                <td>${renderCheckmark(student.certificado)}</td>
                <td class="text-right">
                    <button class="btn btn-outline" onclick="editDocuments('${student.id}')">✎</button>
                </td>
            </tr>
        `).join('');
    }

    function renderCheckmark(value) {
        return value ? '<span class="checkmark">✓</span>' : '<span class="checkmark empty">-</span>';
    }

    function populateStudentSelect() {
        const students = storage.getAll();
        const select = document.getElementById('studentSelect');
        select.innerHTML = '<option value="">Selecione um aluno...</option>' +
            students.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
    }

    document.getElementById('searchInput').addEventListener('input', renderDocs);

    document.getElementById('newDocBtn').addEventListener('click', () => {
        currentStudent = null;
        document.getElementById('docForm').reset();
        document.querySelectorAll('input[name="docs"]').forEach(cb => cb.checked = false);
        document.getElementById('docModal').classList.add('active');
    });

    window.editDocuments = function(id) {
        currentStudent = storage.getById(id);
        document.getElementById('studentSelect').value = id;
        
        document.querySelectorAll('input[name="docs"]').forEach(cb => {
            cb.checked = currentStudent[cb.value] || false;
        });

        document.getElementById('docModal').classList.add('active');
    };

    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('docModal').addEventListener('click', e => {
        if (e.target.id === 'docModal') closeModal();
    });

    function closeModal() {
        document.getElementById('docModal').classList.remove('active');
    }

    document.getElementById('docForm').addEventListener('submit', e => {
        e.preventDefault();

        const studentId = document.getElementById('studentSelect').value;
        const student = storage.getById(studentId);

        if (!student) {
            toast.show('Selecione um aluno válido', 'error');
            return;
        }

        document.querySelectorAll('input[name="docs"]').forEach(cb => {
            student[cb.value] = cb.checked;
        });

        storage.save(student);
        closeModal();
        renderDocs();
        toast.show('Documentos atualizados com sucesso!', 'success');
    });
}
