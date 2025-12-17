document.addEventListener("DOMContentLoaded", () => {
    const btnDownload = document.querySelector(".download-btn");
    if (!btnDownload) return;

    const alunoId = document.body.dataset.alunoId;

    if (!alunoId) {
        console.error("Aluno ID não encontrado no preview");
        return;
    }

    btnDownload.addEventListener("click", () => {
        const url = `/api/documentos/registro/${alunoId}/docx`;
        window.location.href = url;
    });
});
