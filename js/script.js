async function getCoordinates(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
            throw new Error('CEP inválido');
        }
        console.log(data);
        const address = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`;
        console.log(address);
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
        const geoData = await geoResponse.json();
        if (geoData.length === 0) {
            throw new Error('Endereço não encontrado');
        }
        return {
            lat: parseFloat(geoData[0].lat),
            lon: parseFloat(geoData[0].lon)
        };
    } catch (error) {
        alert(error.message);
        return null;
    }
}

function calculateDistance() {
    const cep1 = document.getElementById('cep1').value;
    const cep2 = document.getElementById('cep2').value;
    const loadingElement = document.getElementById('loading');
    const resultElement = document.getElementById('result');
    if (!cep1 || !cep2) {
        alert('Por favor, preencha ambos os campos de CEP');
        return;
    }
    resultElement.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = '';
        }
    });
    loadingElement.style.visibility = 'visible'; // Mostra a barra de carregamento
    resultElement.style.color = 'transparent'; // Torna o texto do resultado invisível

    Promise.all([getCoordinates(cep1), getCoordinates(cep2)])
        .then(([coord1, coord2]) => {
            loadingElement.style.visibility = 'hidden'; // Esconde a barra de carregamento
            resultElement.style.color = '#335f6f'; // Restaura a cor do texto do resultado
            if (coord1 && coord2) {
                const distance = getDistance(coord1.lat, coord1.lon, coord2.lat, coord2.lon);
                resultElement.innerHTML = `
                    <div id="loading" style="visibility: hidden">
                        <div class="spinner"></div>
                    </div>
                    <p>A distância entre os CEPs é ${distance.toFixed(2)} km</p>
                `;

            }
        });
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
}