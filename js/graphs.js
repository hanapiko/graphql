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

export function drawProjectPassFailChart(projects) {
  const svg = document.getElementById("auditChart");
  svg.innerHTML = "";
  
  console.log("Projects data received:", projects); // Debug log
  
  if (!projects || projects.length === 0) {
    console.log("No projects data available"); // Debug log
    return;
  }

  // Process project data - count unique projects with final grades
  const projectMap = new Map();
  
  // First, let's sort projects by ID to see the chronological order
  const sortedProjects = [...projects].sort((a, b) => a.id - b.id);
  
  console.log("Projects sorted by ID (chronological order):");
  sortedProjects.forEach(p => {
    console.log(`ID ${p.id}: ${p.path.split('/').pop()} - Grade ${p.grade}`);
  });
  
  // Group projects by name to analyze attempts
  const projectGroups = new Map();
  sortedProjects.forEach(project => {
    const projectName = project.path.split('/').pop();
    if (!projectGroups.has(projectName)) {
      projectGroups.set(projectName, []);
    }
    projectGroups.get(projectName).push(project);
  });
  
  // For each project, determine the final status
  projectGroups.forEach((attempts, projectName) => {
    console.log(`\nAnalyzing ${projectName}:`);
    attempts.forEach(attempt => {
      console.log(`  ID ${attempt.id}: Grade ${attempt.grade}`);
    });
    
    // Check if this project was ever failed (has any grade 0 attempts)
    const hasFailedAttempts = attempts.some(attempt => attempt.grade === 0);
    const hasNullAttempts = attempts.some(attempt => attempt.grade === null);
    
    console.log(`  Has failed attempts: ${hasFailedAttempts}`);
    console.log(`  Has null attempts: ${hasNullAttempts}`);
    
    // Determine final status:
    // - If project has any failed attempts (grade 0), mark as failed
    // - If project has any null attempts and no failed attempts, mark as ongoing
    // - Otherwise, mark as passed
    let finalGrade;
    if (hasFailedAttempts) {
      finalGrade = 0; // Failed (even if later passed)
      console.log(`  Final status: FAILED (was failed at least once)`);
    } else if (hasNullAttempts) {
      finalGrade = null; // Ongoing
      console.log(`  Final status: ONGOING (has null grades)`);
    } else {
      finalGrade = 1; // Passed (all attempts were successful)
      console.log(`  Final status: PASSED (all attempts successful)`);
    }
    
    projectMap.set(projectName, finalGrade);
  });
  
  // Convert map to array of unique projects with final grades
  const uniqueProjects = Array.from(projectMap.entries()).map(([name, grade]) => ({
    name,
    grade,
    path: `/kisumu/module/${name}`
  }));
  
  console.log("Unique projects with best grades:", uniqueProjects);
  
  const passed = uniqueProjects.filter(p => p.grade !== null && p.grade > 0).length;
  const failed = uniqueProjects.filter(p => p.grade === 0).length;
  const ongoing = uniqueProjects.filter(p => p.grade === null).length;
  const total = passed + failed + ongoing;
  
  // Detailed breakdown for debugging
  const passedProjects = uniqueProjects.filter(p => p.grade !== null && p.grade > 0);
  const failedProjects = uniqueProjects.filter(p => p.grade === 0);
  const ongoingProjects = uniqueProjects.filter(p => p.grade === null);
  
  console.log("=== UNIQUE PROJECT BREAKDOWN ===");
  console.log("PASSED projects:", passedProjects.map(p => ({ name: p.name, grade: p.grade })));
  console.log("FAILED projects:", failedProjects.map(p => ({ name: p.name, grade: p.grade })));
  console.log("ONGOING projects:", ongoingProjects.map(p => ({ name: p.name, grade: p.grade })));
  console.log("Project stats - Passed:", passed, "Failed:", failed, "Ongoing:", ongoing, "Total:", total); // Debug log
  
  if (total === 0) {
    console.log("No valid project grades found"); // Debug log
    return;
  }

  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Data for the chart - three categories
  const data = [
    { label: "Passed", value: passed, color: "#10b981" },
    { label: "Failed", value: failed, color: "#ef4444" },
    { label: "Ongoing", value: ongoing, color: "#3b82f6" }
  ];

  const maxValue = Math.max(passed, failed, ongoing);
  const barWidth = (chartWidth - 80) / 3; // Space for 3 bars with gaps
  const barSpacing = 40;

  // Draw bars
  data.forEach((item, i) => {
    const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
    const x = margin.left + i * (barWidth + barSpacing);
    const y = margin.top + chartHeight - barHeight;

    // Bar
    const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bar.setAttribute("x", x);
    bar.setAttribute("y", y);
    bar.setAttribute("width", barWidth);
    bar.setAttribute("height", barHeight);
    bar.setAttribute("fill", item.color);
    bar.setAttribute("rx", 4);
    svg.appendChild(bar);

    // Value label on top of bar
    const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueLabel.setAttribute("x", x + barWidth / 2);
    valueLabel.setAttribute("y", y - 8);
    valueLabel.setAttribute("text-anchor", "middle");
    valueLabel.setAttribute("font-size", "14");
    valueLabel.setAttribute("font-weight", "bold");
    valueLabel.setAttribute("fill", "#374151");
    valueLabel.textContent = item.value;
    svg.appendChild(valueLabel);

    // Label below bar
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + barWidth / 2);
    label.setAttribute("y", margin.top + chartHeight + 20);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "12");
    label.setAttribute("fill", "#6b7280");
    label.textContent = item.label;
    svg.appendChild(label);
  });

  // Draw Y-axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", margin.left);
  yAxis.setAttribute("y1", margin.top);
  yAxis.setAttribute("x2", margin.left);
  yAxis.setAttribute("y2", margin.top + chartHeight);
  yAxis.setAttribute("stroke", "#d1d5db");
  yAxis.setAttribute("stroke-width", 1);
  svg.appendChild(yAxis);

  // Draw X-axis
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", margin.left);
  xAxis.setAttribute("y1", margin.top + chartHeight);
  xAxis.setAttribute("x2", margin.left + chartWidth);
  xAxis.setAttribute("y2", margin.top + chartHeight);
  xAxis.setAttribute("stroke", "#d1d5db");
  xAxis.setAttribute("stroke-width", 1);
  svg.appendChild(xAxis);

  // Add Y-axis labels
  [0, maxValue].forEach((val, i) => {
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", margin.left - 10);
    label.setAttribute("y", margin.top + chartHeight - (val / maxValue) * chartHeight + 5);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("font-size", "12");
    label.setAttribute("fill", "#6b7280");
    label.textContent = val;
    svg.appendChild(label);
  });

  // Add total projects info
  const totalLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  totalLabel.setAttribute("x", width / 2);
  totalLabel.setAttribute("y", height - 10);
  totalLabel.setAttribute("text-anchor", "middle");
  totalLabel.setAttribute("font-size", "12");
  totalLabel.setAttribute("fill", "#374151");
  totalLabel.setAttribute("font-weight", "bold");
  totalLabel.textContent = `Total Projects: ${total}`;
  svg.appendChild(totalLabel);
}
