if (document.getElementById('totalStudents')) {
    const storage = new StudentStorage();

    document.addEventListener('DOMContentLoaded', () => {
        renderStats();
        renderCourseReport();
        renderClassReport();
    });

    function renderStats() {
        const students = storage.getAll();

        const total = students.length;
        const active = students.filter(s => s.status === 'ativo').length;
        const completed = students.filter(s => s.status === 'concluido').length;
        const dropout = students.filter(s => s.status === 'evadido').length;

        document.getElementById('totalStudents').textContent = total;
        document.getElementById('activeStudents').textContent = active;
        document.getElementById('completedStudents').textContent = completed;
        document.getElementById('dropoutStudents').textContent = dropout;
    }

    function renderCourseReport() {
        const students = storage.getAll();
        const courses = {};

        students.forEach(s => {
            if (!courses[s.curso]) {
                courses[s.curso] = { total: 0, active: 0, completed: 0, dropout: 0 };
            }
            courses[s.curso].total++;
            if (s.status === 'ativo') courses[s.curso].active++;
            if (s.status === 'concluido') courses[s.curso].completed++;
            if (s.status === 'evadido') courses[s.curso].dropout++;
        });

        const tbody = document.getElementById('courseTable');
        tbody.innerHTML = Object.entries(courses).map(([course, data]) => `
            <tr>
                <td><strong>${course}</strong></td>
                <td>${data.total}</td>
                <td>${data.active}</td>
                <td>${data.completed}</td>
                <td>${data.dropout}</td>
            </tr>
        `).join('');
    }

    function renderClassReport() {
        const students = storage.getAll();
        const classes = {};

        students.forEach(s => {
            if (!classes[s.turma]) {
                classes[s.turma] = { total: 0, active: 0, completed: 0, dropout: 0 };
            }
            classes[s.turma].total++;
            if (s.status === 'ativo') classes[s.turma].active++;
            if (s.status === 'concluido') classes[s.turma].completed++;
            if (s.status === 'evadido') classes[s.turma].dropout++;
        });

        const tbody = document.getElementById('classTable');
        tbody.innerHTML = Object.entries(classes).map(([cls, data]) => `
            <tr>
                <td><strong>${cls}</strong></td>
                <td>${data.total}</td>
                <td>${data.active}</td>
                <td>${data.completed}</td>
                <td>${data.dropout}</td>
            </tr>
        `).join('');
    }
}
