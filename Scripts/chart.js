
// Funções do gráfico
function createRadarChart() {
    const ctx = document.getElementById('character-chart').getContext('2d');
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(attributes),
            datasets: [{
                label: 'Atributos',
                data: Object.values(attributes),
                backgroundColor: 'rgba(179, 135, 40, 0.8)',
                borderColor: 'rgba(179, 135, 40, 1)',
                borderWidth: 4,
                pointBackgroundColor: 'rgba(179, 135, 40, 1)',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: true, color: 'white' },
                    grid: { color: 'white' },
                    suggestedMin: 0,
                    suggestedMax: maxScale,
                    ticks: { display: false },
                    pointLabels: {
                        color: 'rgb(179, 135, 40)',
                        font: { size: 16, weight: 'bold' },
                        callback: function (value) {
                            return `${value} ${attributes[value]}`;
                        }
                    }
                }
            },
            elements: { line: { tension: 0.1 } },
            plugins: { 
                legend: { display: false },
                tooltip: { enabled: false }
            },
            onClick: (e) => {
                const points = radarChart.getElementsAtEventForMode(e, 'point', { intersect: true }, false);
                if (points.length > 0) {
                    const clickedAttribute = radarChart.data.labels[points[0].index];
                    increment(clickedAttribute);
                }
            }
        },
        plugins: [{
            id: 'positionButtons',
            afterDraw: function(chart) {
                positionButtons(chart);
            }
        }]
    });
}

const positionButtons = _.throttle(function(chart) {
    const buttonsContainer = document.querySelector('.label-buttons');
    if (!buttonsContainer || !chart.chartArea) return;
    
    buttonsContainer.innerHTML = '';
    
    const { left, right, top, bottom } = chart.chartArea;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const radius = Math.min(right - left, bottom - top) / 2 * 0.7;
    
}, 100); // Throttle de 100ms



function updateChart() {
    radarChart.data.datasets[0].data = Object.values(attributes);
    radarChart.update();
}