document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const confirmacao = document.querySelector('input[name="confirmacao"]:checked').value;

        if (!confirmacao) {
            showMessage('Por favor, selecione uma opção de confirmação.', 'error');
            return;
        }

        if (nome.trim() === '') {
            showMessage('Por favor, digite seu nome.', 'error');
            return;
        }

        const dados = {
            nome: nome,
            status: confirmacao
        };

        try {
            const response = await fetch('/salvar-confirmacao', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                throw new Error('Houve um problema ao salvar sua confirmação. Tente novamente.');
            }

            const mensagem = dados.status === 'sim' 
                ? `Obrigado pela confirmação, ${dados.nome}! Estamos muito felizes em celebrar com você.`
                : `Que pena que você não poderá comparecer, ${dados.nome}. Sentiremos sua falta!`;

            showMessage(mensagem, 'success');
            form.reset();

        } catch (error) {
            showMessage(error.message, 'error');
        }

    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = type;
        formMessage.classList.remove('hidden');

        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 7000);
    }
});

function solicitarUber() {
    const latitude = -12.913993;
    const longitude = -38.497906;
    const nomeDoDestino = "Avenida Beira Mar, 419, Ribeira";
    const url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${encodeURIComponent(nomeDoDestino)}`;
    location.href = url;
}