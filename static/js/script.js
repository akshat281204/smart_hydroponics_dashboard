let sensorData = {
    motion: "No",
    sound: "No",
    temperature: 0,
    distance: 0,
    intruder: "No",
    ph: 0
};

document.addEventListener('DOMContentLoaded', function () {
    fetchSensorData();
    setInterval(fetchSensorData, 3000);
    createFloatingParticles();
});

function fetchSensorData() {
    fetch(`${FIREBASE_URL}/data.json`)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched:", data);

            sensorData.temperature = data.temperature ?? 0;
            sensorData.distance = data.distance ?? 0;
            sensorData.motion = data.motion ?? "No";
            sensorData.sound = data.sound ?? "No";
            sensorData.ph = data.ph ?? 0;

            sensorData.intruder = (sensorData.motion === "Yes" && sensorData.sound === "Yes") ? "Yes" : "No";

            updateDashboard();
        })
        .catch(error => {
            console.error("Error fetching:", error);
        });
}

function updateDashboard() {
    const tempValue = document.getElementById('tempValue');
    const tempStatus = document.getElementById('tempStatus');
    if (tempValue) tempValue.textContent = sensorData.temperature.toFixed(1) + ' °C';

    if (tempStatus) {
        if (sensorData.temperature < 18) {
            tempStatus.textContent = "Low Temperature";
            tempStatus.style.color = '#3b82f6'; // blueish for low temp (optional)
        } else if (sensorData.temperature > 26) {
            tempStatus.textContent = "High Temperature";
            tempStatus.style.color = '#ef4444'; // red for high temp (optional)
        } else {
            tempStatus.textContent = "Normal";
            tempStatus.style.color = '#22c55e'; // green for normal temp (optional)
        }
    }

    const phValue=document.getElementById('phValue');
    const phStatus=document.getElementById('phStatus');
    if(phValue) phValue.textContent=sensorData.ph + 'pH';

    if (phValue) {
        if (sensorData.ph < 5.5) {
            phValue.phStatus = "pH Below Optimal";
            phStatus.style.color = '#ef4444';
        } else if (sensorData.ph > 6.6) {
            phValue.phStatus = "pH Higher Than Optimal";
            phStatus.style.color = '#3b82f6';
        } else {
            phValue.phStatus = "Normal";
            phStatus.style.color = '#22c55e'; 
        }
    }

    const waterPercentage = document.getElementById('waterPercentage');
    if (waterPercentage) waterPercentage.textContent = sensorData.distance + ' cm';

    updateSecurityCard('motion', sensorData.motion);
    updateSecurityCard('sound', sensorData.sound);
    updateSecurityCard('intruder', sensorData.intruder);

    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) lastUpdate.textContent = `Last Updated: ${new Date().toLocaleString()}`;
}

function updateSecurityCard(type, value) {
    const card = document.getElementById(`${type}Card`);
    const status = document.getElementById(`${type}Status`);
    const bar = document.getElementById(`${type}Bar`);

    if (!card || !status || !bar) return;

    status.textContent = value;

    card.classList.remove('alert');
    status.classList.remove('safe', 'alert', 'danger');

    if (value === 'Yes' || value === 'Detected') {
        card.classList.add('alert');
        status.classList.add('alert');
        bar.style.width = '100%';
        bar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
    } else {
        status.classList.add('safe');
        bar.style.width = '20%';
        bar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
    }
}

function createFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(34, 197, 94, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 20 + 15}s infinite linear;
            animation-delay: ${Math.random() * 20}s;
        `;
        particlesContainer.appendChild(particle);
    }
}