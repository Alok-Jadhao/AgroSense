// ==================== 
// Firebase Configuration
// ==================== 
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForClientSide",
    authDomain: "angrosense.firebaseapp.com",
    databaseURL: "https://angrosense-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "angrosense",
    storageBucket: "angrosense.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ==================== 
// Global Variables
// ==================== 
let temperatureData = [];
let humidityData = [];
let timeLabels = [];
let chart = null;
const MAX_DATA_POINTS = 20;

// ==================== 
// DOM Elements
// ==================== 
const temperatureValueEl = document.getElementById('temperatureValue');
const humidityValueEl = document.getElementById('humidityValue');
const lastUpdatedEl = document.getElementById('lastUpdated');
const tempStatusEl = document.getElementById('tempStatus');
const humidityStatusEl = document.getElementById('humidityStatus');
const insightsContainerEl = document.getElementById('insightsContainer');

// ==================== 
// Initialize Chart
// ==================== 
function initChart() {
    const ctx = document.getElementById('dataChart').getContext('2d');
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatureData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Humidity (%)',
                    data: humidityData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(1);
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ==================== 
// Update Chart Data
// ==================== 
function updateChartData(temperature, humidity) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Add new data
    temperatureData.push(temperature);
    humidityData.push(humidity);
    timeLabels.push(timeString);
    
    // Keep only last MAX_DATA_POINTS
    if (temperatureData.length > MAX_DATA_POINTS) {
        temperatureData.shift();
        humidityData.shift();
        timeLabels.shift();
    }
    
    // Update chart
    if (chart) {
        chart.update('none'); // Update without animation for real-time feel
    }
}

// ==================== 
// Update Status Badge
// ==================== 
function updateStatus(element, status, message) {
    element.innerHTML = `
        <div class="status-dot"></div>
        <span>${message}</span>
    `;
    
    const statusColors = {
        normal: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    };
    
    const statusBg = {
        normal: '#d1fae5',
        warning: '#fef3c7',
        danger: '#fee2e2'
    };
    
    element.style.background = statusBg[status];
    element.style.color = statusColors[status];
    element.querySelector('.status-dot').style.background = statusColors[status];
}

// ==================== 
// Generate Insights
// ==================== 
function generateInsights(temperature, humidity) {
    const insights = [];
    
    // Temperature Insights
    if (temperature > 35) {
        insights.push({
            type: 'warning',
            icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`,
            title: 'High Temperature Alert',
            description: `Temperature is ${temperature.toFixed(1)}°C - Above optimal range. Consider irrigation and provide shade for crops. Heat stress may affect plant growth.`
        });
    } else if (temperature >= 25 && temperature <= 35) {
        insights.push({
            type: 'success',
            icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`,
            title: 'Optimal Temperature',
            description: `Temperature is ${temperature.toFixed(1)}°C - Perfect for most crops. Continue regular monitoring and maintenance.`
        });
    } else if (temperature < 25) {
        insights.push({
            type: 'info',
            icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`,
            title: 'Cool Temperature',
            description: `Temperature is ${temperature.toFixed(1)}°C - Below optimal range. Some crops may grow slower. Good for cool-season vegetables.`
        });
    }
    
    // Humidity Insights
    if (humidity < 40) {
        insights.push({
            type: 'caution',
            icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>`,
            title: 'Low Humidity Warning',
            description: `Humidity is ${humidity.toFixed(1)}% - Soil may be dry. Increase irrigation frequency. Plants may experience water stress.`
        });
    } else if (humidity >= 40 && humidity <= 70) {
        insights.push({
            type: 'success',
            icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>`,
            title: 'Ideal Humidity Level',
            description: `Humidity is ${humidity.toFixed(1)}% - Excellent moisture level. Maintain current irrigation schedule for optimal growth.`
        });
    } else if (humidity > 70) {
        insights.push({
            type: 'warning',
            icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
            </svg>`,
            title: 'High Humidity Alert',
            description: `Humidity is ${humidity.toFixed(1)}% - Risk of fungal diseases. Ensure proper ventilation and reduce watering if necessary.`
        });
    }
    
    // Soil and Farming Recommendations
    if (humidity < 40 && temperature > 30) {
        insights.push({
            type: 'warning',
            icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m-6-6H0m6 0h6"/>
            </svg>`,
            title: 'Soil Dryness Risk',
            description: 'Hot and dry conditions detected. Soil moisture is likely low. Implement drip irrigation and apply mulch to retain moisture.'
        });
    }
    
    // General farming suggestions
    insights.push({
        type: 'info',
        icon: `<svg class="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>`,
        title: 'Farming Recommendations',
        description: getGeneralRecommendations(temperature, humidity)
    });
    
    // Render insights
    renderInsights(insights);
}

// ==================== 
// Get General Recommendations
// ==================== 
function getGeneralRecommendations(temp, humidity) {
    if (temp > 35 || humidity < 30) {
        return 'Focus on heat-resistant crops. Water early morning or evening. Use shade nets and mulching.';
    } else if (temp >= 25 && temp <= 35 && humidity >= 40 && humidity <= 70) {
        return 'Ideal conditions for tomatoes, peppers, cucumbers. Maintain regular care schedule.';
    } else if (temp < 25) {
        return 'Good for leafy greens, broccoli, cauliflower. Consider cold-tolerant varieties.';
    } else if (humidity > 70) {
        return 'Watch for pests and diseases. Ensure air circulation. Reduce nitrogen fertilizer.';
    } else {
        return 'Monitor daily and adjust watering based on plant needs. Keep records for future planning.';
    }
}

// ==================== 
// Render Insights
// ==================== 
function renderInsights(insights) {
    insightsContainerEl.innerHTML = insights.map(insight => `
        <div class="insight-card ${insight.type}">
            <div class="insight-header">
                ${insight.icon}
                <h3 class="insight-title">${insight.title}</h3>
            </div>
            <p class="insight-description">${insight.description}</p>
        </div>
    `).join('');
}

// ==================== 
// Update Last Updated Time
// ==================== 
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    lastUpdatedEl.textContent = `Last updated: ${timeString}`;
}

// ==================== 
// Firebase Real-Time Listeners
// ==================== 
function setupRealtimeListeners() {
    // Listen to Temperature
    database.ref('sensorData/temperature').on('value', (snapshot) => {
        const temperature = snapshot.val();
        
        if (temperature !== null) {
            // Update UI
            temperatureValueEl.textContent = temperature.toFixed(1);
            
            // Update status
            if (temperature > 35) {
                updateStatus(tempStatusEl, 'danger', 'High Temperature');
            } else if (temperature >= 25) {
                updateStatus(tempStatusEl, 'normal', 'Normal Range');
            } else {
                updateStatus(tempStatusEl, 'warning', 'Below Optimal');
            }
            
            // Get humidity for insights
            database.ref('sensorData/humidity').once('value', (humSnapshot) => {
                const humidity = humSnapshot.val();
                if (humidity !== null) {
                    updateChartData(temperature, humidity);
                    generateInsights(temperature, humidity);
                }
            });
            
            updateLastUpdatedTime();
        }
    }, (error) => {
        console.error('Error reading temperature:', error);
        temperatureValueEl.textContent = 'Error';
        updateStatus(tempStatusEl, 'danger', 'Connection Error');
    });
    
    // Listen to Humidity
    database.ref('sensorData/humidity').on('value', (snapshot) => {
        const humidity = snapshot.val();
        
        if (humidity !== null) {
            // Update UI
            humidityValueEl.textContent = humidity.toFixed(1);
            
            // Update status
            if (humidity < 40) {
                updateStatus(humidityStatusEl, 'warning', 'Low Humidity');
            } else if (humidity <= 70) {
                updateStatus(humidityStatusEl, 'normal', 'Ideal Range');
            } else {
                updateStatus(humidityStatusEl, 'danger', 'High Humidity');
            }
            
            updateLastUpdatedTime();
        }
    }, (error) => {
        console.error('Error reading humidity:', error);
        humidityValueEl.textContent = 'Error';
        updateStatus(humidityStatusEl, 'danger', 'Connection Error');
    });
}

// ==================== 
// Initialize App
// ==================== 
function initApp() {
    console.log('🌱 AgroSense Dashboard Initializing...');
    
    // Initialize chart
    initChart();
    
    // Setup Firebase listeners
    setupRealtimeListeners();
    
    // Initial update time
    updateLastUpdatedTime();
    
    console.log('✅ Dashboard Ready!');
}

// ==================== 
// Start Application
// ==================== 
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
