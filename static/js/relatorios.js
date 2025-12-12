if (document.getElementById('totalStudents')) {
    
    document.addEventListener('DOMContentLoaded', () => {
        carregarRelatorios();
    });

    async function carregarRelatorios() {
        try {
            const response = await fetch('/api/relatorios');
            const data = await response.json();

            renderStats(data.resumo);
            renderTable('courseTable', data.cursos);
            renderTable('classTable', data.turmas);

        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
            document.getElementById('totalStudents').textContent = '-';
        }
    }

    function renderStats(resumo) {
        animateValue("totalStudents", 0, resumo.total, 1000);
        animateValue("activeStudents", 0, resumo.ativo, 1000);
        animateValue("completedStudents", 0, resumo.concluido, 1000);
        animateValue("dropoutStudents", 0, resumo.evadido, 1000);
    }

    function renderTable(elementId, dataObj) {
        const tbody = document.getElementById(elementId);
        
        if (Object.keys(dataObj).length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sem dados registrados</td></tr>';
            return;
        }

        tbody.innerHTML = Object.entries(dataObj).map(([nome, stats]) => `
            <tr>
                <td><strong>${nome}</strong></td>
                <td>${stats.total}</td>
                <td><span class="text-success">${stats.ativo}</span></td>
                <td><span class="text-primary">${stats.concluido}</span></td>
                <td><span class="text-danger">${stats.evadido}</span></td>
            </tr>
        `).join('');
    }

    function animateValue(id, start, end, duration) {
        if (start === end) return;
        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        const obj = document.getElementById(id);
        
        const timer = setInterval(function() {
            current += increment;
            obj.textContent = current;
            if (current == end) {
                clearInterval(timer);
            }
        }, stepTime > 0 ? stepTime : 10);
        if(stepTime <= 0) obj.textContent = end; 
    }
}