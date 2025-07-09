export function drawXPLineChart(transactions) {
    const svg = document.getElementById('xpChart');
    svg.innerHTML = '';
    if (!transactions || transactions.length === 0) return;

    // Prepare data: sort by date, calculate cumulative XP
    const sorted = [...transactions]
    .filter(t => t.createdAt && !isNaN(new Date(t.createdAt)))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
if (sorted.length === 0) return;
let cumulative = 0;
const data = sorted.map(t => {
    cumulative += t.amount;
    return { date: new Date(t.createdAt), xp: cumulative / 1000000 }; // MB
});

    // Scales
    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const minDate = data[0].date;
    const maxDate = data[data.length - 1].date;
    const maxXP = Math.max(...data.map(d => d.xp));

    const xScale = d => {
        if (maxDate - minDate === 0) return margin.left + chartWidth / 2;
        return margin.left + ((d - minDate) / (maxDate - minDate)) * chartWidth;
    };
    const yScale = xp => margin.top + chartHeight - (xp / maxXP) * chartHeight;

    // Draw line
    let path = '';
    data.forEach((d, i) => {
        path += (i === 0 ? 'M' : 'L') + xScale(d.date) + ' ' + yScale(d.xp) + ' ';
    });
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', path.trim());
    line.setAttribute('stroke', '#4f46e5');
    line.setAttribute('stroke-width', 2);
    line.setAttribute('fill', 'none');
    svg.appendChild(line);

    // Draw Y-axis
const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
yAxis.setAttribute('x1', margin.left);
yAxis.setAttribute('y1', margin.top);
yAxis.setAttribute('x2', margin.left);
yAxis.setAttribute('y2', margin.top + chartHeight);
yAxis.setAttribute('stroke', '#888');
yAxis.setAttribute('stroke-width', 1);
svg.appendChild(yAxis);

// Draw X-axis
const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
xAxis.setAttribute('x1', margin.left);
xAxis.setAttribute('y1', margin.top + chartHeight);
xAxis.setAttribute('x2', margin.left + chartWidth);
xAxis.setAttribute('y2', margin.top + chartHeight);
xAxis.setAttribute('stroke', '#888');
xAxis.setAttribute('stroke-width', 1);
svg.appendChild(xAxis);

// Add Y-axis labels (0 and maxXP)
[0, maxXP].forEach((val, i) => {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', margin.left - 10);
    label.setAttribute('y', yScale(val) + 5);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '12');
    label.textContent = val.toFixed(2) + ' MB';
    svg.appendChild(label);
});

// Add X-axis labels (first and last date)
[minDate, maxDate].forEach((date, i) => {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', xScale(date));
    label.setAttribute('y', margin.top + chartHeight + 20);
    label.setAttribute('text-anchor', i === 0 ? 'start' : 'end');
    label.setAttribute('font-size', '12');
    label.textContent = date.toLocaleDateString();
    svg.appendChild(label);
});

// Add dots for each data point
data.forEach(d => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', xScale(d.date));
    dot.setAttribute('cy', yScale(d.xp));
    dot.setAttribute('r', 3);
    dot.setAttribute('fill', '#4f46e5');
    svg.appendChild(dot);
});
}

export function drawAuditPieChart(audits) {
    const svg = document.getElementById('auditChart');
    svg.innerHTML = '';
    if (!audits || audits.length === 0) return;

    const up = audits.filter(a => a.type === 'up').reduce((sum, a) => sum + a.amount, 0);
    const down = audits.filter(a => a.type === 'down').reduce((sum, a) => sum + Math.abs(a.amount), 0);
    const total = up + down;
    if (total === 0) return;

    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;
    const radius = Math.min(width, height) / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;

    // Pie slices
    const upAngle = (up / total) * 2 * Math.PI;
    const downAngle = (down / total) * 2 * Math.PI;

    // Up slice
    const x1 = centerX + radius * Math.cos(-Math.PI / 2);
    const y1 = centerY + radius * Math.sin(-Math.PI / 2);
    const x2 = centerX + radius * Math.cos(upAngle - Math.PI / 2);
    const y2 = centerY + radius * Math.sin(upAngle - Math.PI / 2);
    const largeArc = upAngle > Math.PI ? 1 : 0;
    const upPath = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
    ].join(' ');
    const upSlice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    upSlice.setAttribute('d', upPath);
    upSlice.setAttribute('fill', '#10b981');
    svg.appendChild(upSlice);

    // Down slice
    const x3 = centerX + radius * Math.cos(upAngle - Math.PI / 2);
    const y3 = centerY + radius * Math.sin(upAngle - Math.PI / 2);
    const x4 = centerX + radius * Math.cos(2 * Math.PI - Math.PI / 2);
    const y4 = centerY + radius * Math.sin(2 * Math.PI - Math.PI / 2);
    const downPath = [
        `M ${centerX} ${centerY}`,
        `L ${x3} ${y3}`,
        `A ${radius} ${radius} 0 ${upAngle > Math.PI ? 0 : 1} 1 ${x4} ${y4}`,
        'Z'
    ].join(' ');
    const downSlice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    downSlice.setAttribute('d', downPath);
    downSlice.setAttribute('fill', '#ef4444');
    svg.appendChild(downSlice);

    // Add legend with counts
    const performedCount = audits.filter(a => a.type === 'up').length;
    const receivedCount = audits.filter(a => a.type === 'down').length;
    const legendData = [
        { color: '#10b981', label: `Audits Performed (${performedCount})` },
        { color: '#ef4444', label: `Audits Received (${receivedCount})` }
    ];
    legendData.forEach((item, i) => {
        // Rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 10);
        rect.setAttribute('y', 20 + i * 25);
        rect.setAttribute('width', 18);
        rect.setAttribute('height', 18);
        rect.setAttribute('fill', item.color);
        svg.appendChild(rect);

        // Text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 35);
        text.setAttribute('y', 34 + i * 25);
        text.setAttribute('font-size', '14');
        text.setAttribute('fill', '#222');
        text.textContent = item.label;
        svg.appendChild(text);
    });
}