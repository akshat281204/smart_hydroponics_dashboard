// Import Firebase modules
import firebase from 'firebase/app';
import 'firebase/database';

// Initialize Firebase using the injected config
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global variables for gauges
let temperatureGauge, phGauge, ecGauge, tdsGauge;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    initializeGauges();
    startDataListening();
    setupEventListeners();
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
});

// Create and initialize gauges
function initializeGauges() {
    temperatureGauge = createGauge('temperatureGauge', 0, 50, '°C', '#e74c3c');
    phGauge = createGauge('phGauge', 0, 14, 'pH', '#f39c12');
    ecGauge = createGauge('ecGauge', 0, 3000, 'μS/cm', '#3498db');
    tdsGauge = createGauge('tdsGauge', 0, 2000, 'ppm', '#9b59b6');
}

function createGauge(canvasId, min, max, unit, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, max],
                backgroundColor: [color, '#ecf0f1'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

function updateGauge(gauge, value, max, elementId, unit) {
    gauge.data.datasets[0].data = [value, max - value];
    gauge.update('none');
    document.getElementById(elementId).textContent = `${value.toFixed(1)}${unit}`;
}

function startDataListening() {
    database.ref('data').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateSensorData(data);
        }
    });
}

function updateSensorData(data) {
    const motion = data.motion === "Yes";
    const sound = data.sound === "Yes";

    updateSecurityStatus(motion, sound);

    if (data.temperature !== undefined) {
        updateGauge(temperatureGauge, data.temperature, 50, 'tempValue', '°C');
    }

    if (data.distance !== undefined) {
        const tankHeight = 20;
        const waterLevel = Math.max(0, Math.min(100, ((tankHeight - data.distance) / tankHeight) * 100));
        updateWaterLevel(waterLevel);
    }

    // Simulated values if real ones are not present
    const ph = 6.5 + Math.random() * 1;
    const ec = 1200 + Math.random() * 400;
    const tds = 600 + Math.random() * 200;

    updateGauge(phGauge, ph, 14, 'phValue', '');
    updateGauge(ecGauge, ec, 3000, 'ecValue', ' μS/cm');
    updateGauge(tdsGauge, tds, 2000, 'tdsValue', ' ppm');
}

function updateSecurityStatus(motion, sound) {
    const motionCard = document.getElementById('motionCard');
    const soundCard = document.getElementById('soundCard');
    const intruderCard = document.getElementById('intruderCard');

    const motionStatus = document.getElementById('motionStatus');
    const soundStatus = document.getElementById('soundStatus');
    const intruderStatus = document.getElementById('intruderStatus');

    if (motion) {
        motionStatus.textContent = 'YES';
        motionStatus.className = 'status-value yes';
        motionCard.classList.add('active');
    } else {
        motionStatus.textContent = 'NO';
        motionStatus.className = 'status-value no';
        motionCard.classList.remove('active');
    }

    if (sound) {
        soundStatus.textContent = 'YES';
        soundStatus.className = 'status-value yes';
        soundCard.classList.add('active');
    } else {
        soundStatus.textContent = 'NO';
        soundStatus.className = 'status-value no';
        soundCard.classList.remove('active');
    }

    const intruderDetected = motion && sound;
    if (intruderDetected) {
        intruderStatus.textContent = 'YES';
        intruderStatus.className = 'status-value yes';
        intruderCard.classList.add('alert');
        intruderCard.classList.remove('active');
    } else {
        intruderStatus.textContent = 'NO';
        intruderStatus.className = 'status-value no';
        intruderCard.classList.remove('alert', 'active');
    }
}

function updateWaterLevel(level) {
    const waterFill = document.getElementById('waterFill');
    const waterPercentage = document.getElementById('waterPercentage');
    const percentage = Math.max(0, Math.min(100, level));

    waterFill.style.height = `${percentage}%`;
    waterPercentage.textContent = `${percentage.toFixed(0)}%`;

    if (percentage < 20) {
        waterFill.style.background = 'linear-gradient(to top, #e74c3c, #ec7063)';
    } else if (percentage < 50) {
        waterFill.style.background = 'linear-gradient(to top, #f39c12, #f7dc6f)';
    } else {
        waterFill.style.background = 'linear-gradient(to top, #3498db, #5dade2)';
    }
}

function setupEventListeners() {
    document.getElementById('diseaseImageInput').addEventListener('change', handleDiseaseImageUpload);
    document.getElementById('growthPredictBtn').addEventListener('click', generateGrowthPrediction);
}

function handleDiseaseImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const resultDiv = document.getElementById('diseaseResult');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <strong>Image uploaded:</strong> ${file.name}<br>
            <em>Disease detection model will be implemented soon...</em>
        `;
    }
}

function generateGrowthPrediction() {
    const resultDiv = document.getElementById('growthResult');
    const button = document.getElementById('growthPredictBtn');

    button.textContent = 'Analyzing...';
    button.disabled = true;

    setTimeout(() => {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <strong>Growth Prediction Analysis:</strong><br>
            Based on current conditions:<br>
            • Expected growth rate: 15% increase this week<br>
            • Optimal harvest time: 12-14 days<br>
            • Recommendation: Maintain current nutrient levels<br>
            <em>Full AI model will be implemented soon...</em>
        `;

        button.textContent = 'Generate Prediction';
        button.disabled = false;
    }, 2000);
}

function updateTimestamp() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent =
        `Last Updated: ${now.toLocaleString()}`;
}

// Monitor Firebase connection
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        console.log('Connected to Firebase');
    } else {
        console.log('Disconnected from Firebase');
    }
});

function refreshData() {
    database.ref('data').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateSensorData(data);
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}