export function drawXPLineChart(transactions) {
  const svg = document.getElementById("xpChart");
  svg.innerHTML = "";
  if (!transactions || transactions.length === 0) return;

  // Prepare data: sort by date, calculate cumulative XP
  const sorted = [...transactions]
    .filter((t) => t.createdAt && !isNaN(new Date(t.createdAt)))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sorted.length === 0) return;
  let cumulative = 0;
  const data = sorted.map((t) => {
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
  const maxXP = Math.max(...data.map((d) => d.xp));

  const xScale = (d) => {
    if (maxDate - minDate === 0) return margin.left + chartWidth / 2;
    return margin.left + ((d - minDate) / (maxDate - minDate)) * chartWidth;
  };
  const yScale = (xp) => margin.top + chartHeight - (xp / maxXP) * chartHeight;

  // Draw line
  let path = "";
  data.forEach((d, i) => {
    path += (i === 0 ? "M" : "L") + xScale(d.date) + " " + yScale(d.xp) + " ";
  });
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("d", path.trim());
  line.setAttribute("stroke", "#4f46e5");
  line.setAttribute("stroke-width", 2);
  line.setAttribute("fill", "none");
  svg.appendChild(line);

  // Draw Y-axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", margin.left);
  yAxis.setAttribute("y1", margin.top);
  yAxis.setAttribute("x2", margin.left);
  yAxis.setAttribute("y2", margin.top + chartHeight);
  yAxis.setAttribute("stroke", "#888");
  yAxis.setAttribute("stroke-width", 1);
  svg.appendChild(yAxis);

  // Draw X-axis
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", margin.left);
  xAxis.setAttribute("y1", margin.top + chartHeight);
  xAxis.setAttribute("x2", margin.left + chartWidth);
  xAxis.setAttribute("y2", margin.top + chartHeight);
  xAxis.setAttribute("stroke", "#888");
  xAxis.setAttribute("stroke-width", 1);
  svg.appendChild(xAxis);

  // Add Y-axis labels (0 and maxXP)
  [0, maxXP].forEach((val, i) => {
    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    label.setAttribute("x", margin.left - 10);
    label.setAttribute("y", yScale(val) + 5);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("font-size", "12");
    label.textContent = val.toFixed(2) + " MB";
    svg.appendChild(label);
  });

  // Add X-axis labels (first and last date)
  [minDate, maxDate].forEach((date, i) => {
    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    label.setAttribute("x", xScale(date));
    label.setAttribute("y", margin.top + chartHeight + 20);
    label.setAttribute("text-anchor", i === 0 ? "start" : "end");
    label.setAttribute("font-size", "12");
    label.textContent = date.toLocaleDateString();
    svg.appendChild(label);
  });

  // Add dots for each data point
  data.forEach((d) => {
    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    dot.setAttribute("cx", xScale(d.date));
    dot.setAttribute("cy", yScale(d.xp));
    dot.setAttribute("r", 3);
    dot.setAttribute("fill", "#4f46e5");
    svg.appendChild(dot);
  });
}

export function drawAuditRatioChart(auditTransactions) {
  const svg = document.getElementById("auditChart");
  svg.innerHTML = "";

  if (!auditTransactions || auditTransactions.length === 0) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", 20);
    text.setAttribute("y", 40);
    text.setAttribute("font-size", "16");
    text.setAttribute("fill", "#888");
    text.textContent = "No audit data available.";
    svg.appendChild(text);
    return;
  }

  // Count audits performed (up) and received (down)
  const performed = auditTransactions.filter(a => a.type === "up").length;
  const received = auditTransactions.filter(a => a.type === "down").length;

  // Chart data
  const data = [
    { label: "Performed", value: performed, color: "#10b981" },
    { label: "Received", value: received, color: "#6366f1" }
  ];

  // Chart dimensions
  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;

  // Calculate total
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx);
    text.setAttribute("y", cy);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "16");
    text.setAttribute("fill", "#888");
    text.textContent = "No audit data available.";
    svg.appendChild(text);
    return;
  }

  // Draw pie slices
  let startAngle = 0;
  data.forEach((item) => {
    if (item.value === 0) return;
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", item.color);
    svg.appendChild(path);
    startAngle = endAngle;
  });

  // Add labels inside slices
  startAngle = 0;
  data.forEach((item) => {
    if (item.value === 0) return;
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const midAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.65;
    const lx = cx + labelRadius * Math.cos(midAngle);
    const ly = cy + labelRadius * Math.sin(midAngle) + 5;
    const percent = ((item.value / total) * 100).toFixed(0);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", lx);
    label.setAttribute("y", ly);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "14");
    label.setAttribute("fill", "#fff");
    label.setAttribute("font-weight", "bold");
    label.textContent = `${item.value} (${percent}%)`;
    svg.appendChild(label);
    startAngle += sliceAngle;
  });

  // Add chart title
  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.setAttribute("x", width / 2);
  title.setAttribute("y", 28);
  title.setAttribute("text-anchor", "middle");
  title.setAttribute("font-size", "15");
  title.setAttribute("font-weight", "bold");
  title.setAttribute("fill", "#4338ca");
  title.textContent = "Audit Ratio (Performed vs Received)";
  svg.appendChild(title);

  // Add legend
  const legendX = width - 120;
  const legendY = height - 60;
  data.forEach((item, i) => {
    // Color box
    const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    box.setAttribute("x", legendX);
    box.setAttribute("y", legendY + i * 24);
    box.setAttribute("width", 18);
    box.setAttribute("height", 18);
    box.setAttribute("fill", item.color);
    box.setAttribute("rx", 3);
    svg.appendChild(box);
    // Label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", legendX + 26);
    label.setAttribute("y", legendY + i * 24 + 14);
    label.setAttribute("font-size", "13");
    label.setAttribute("fill", "#374151");
    label.textContent = item.label;
    svg.appendChild(label);
  });
}
