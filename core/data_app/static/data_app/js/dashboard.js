// --- Shared State ---
let filteredData = {}; // This will store filtered data shared across all graphs

// --- Utility Function: Filter Dataset ---
const filterDataset = (data, filters) => {
  const filteredIndices = data.year_month
    .map((ym, index) => {
      const isInDateRange = ym >= filters.startDate && ym <= filters.endDate;
      const isMatchingGender =
        filters.selectedGender === "All" || data.gender[index] === filters.selectedGender;
      const isMatchingAgeGroup =
        filters.selectedAgeGroup === "All" || data.age_group[index] === filters.selectedAgeGroup;
      const isMatchingDirection =
        filters.selectedDirection === "All" || data.direction[index] === filters.selectedDirection;

      return isInDateRange && isMatchingGender && isMatchingAgeGroup && isMatchingDirection
        ? index
        : null;
    })
    .filter((index) => index !== null);

  return {
    year_month: filteredIndices.map((i) => data.year_month[i]),
    direction: filteredIndices.map((i) => data.direction[i]),
    estimate: filteredIndices.map((i) => data.estimate[i]),
    age_group: filteredIndices.map((i) => data.age_group[i]),
  };
};

// --- Line Chart Function ---
const plotLineChart = (ctx, data) => {
  const arrivals = {};
  const departures = {};
  data.year_month.forEach((ym, i) => {
    if (!arrivals[ym]) arrivals[ym] = 0;
    if (!departures[ym]) departures[ym] = 0;
    if (data.direction[i] === "Arrivals") arrivals[ym] += data.estimate[i];
    if (data.direction[i] === "Departures") departures[ym] += data.estimate[i];
  });

  const labels = Object.keys(arrivals).sort();
  const arrivalData = labels.map((ym) => arrivals[ym]);
  const departureData = labels.map((ym) => departures[ym]);

  // Create gradient for "Arrivals"
  const gradientArrival = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradientArrival.addColorStop(0, "rgba(75, 192, 192, 0.8)"); // Light teal at the top
  gradientArrival.addColorStop(1, "rgba(75, 192, 192, 0.1)");   // Transparent at the bottom

  // Create gradient for "Departures"
  const gradientDeparture = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradientDeparture.addColorStop(0, "rgba(255, 99, 132, 0.8)"); // Light pink at the top
  gradientDeparture.addColorStop(1, "rgba(255, 99, 132, 0.1)");   // Transparent at the bottom

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Arrivals",
          data: arrivalData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: gradientArrival,
          fill: true,
          tension: 0.5,
        },
        {
          label: "Departures",
          data: departureData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: gradientDeparture,
          fill: true,
          tension: 0.5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => tooltipItems[0].label,
            label: (tooltipItem) =>
              `${tooltipItem.dataset.label}: ${tooltipItem.raw.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Month" },
          ticks: {
            callback: function (value, index, values) {

              const dateParts = this.getLabelForValue(value).split("-");
              const month = dateParts[1]; // Extract month (e.g., "01", "02")
              const year = dateParts[0]; // Extract year
              const date = new Date(`${year}-${month}-01`); // Construct a Date object
              return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date); // Format to "Jan", "Feb", etc.

              return this.getLabelForValue(value); // Show full label otherwise
            },
          },
        },
        y: {
          title: { display: true, text: "Estimate" },
        },
      },
    },
  });
};

// --- Bar Chart Function ---
const plotBarChart = (ctx, data) => {
  // Extract unique age groups and sort them
  const ageGroups = [...new Set(data.age_group)].sort((a, b) => {
    const parseRange = (range) => parseInt(range.split("-")[0]); // Extract the lower bound
    return parseRange(a) - parseRange(b); // Sort by the lower bound
  });

  const barArrivals = ageGroups.map((age) =>
    data.estimate
      .filter((_, i) => data.age_group[i] === age && data.direction[i] === "Arrivals")
      .reduce((sum, value) => sum + value, 0)
  );
  const barDepartures = ageGroups.map((age) =>
    data.estimate
      .filter((_, i) => data.age_group[i] === age && data.direction[i] === "Departures")
      .reduce((sum, value) => sum + value, 0)
  );

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: ageGroups,
      datasets: [
        {
          label: "Arrivals",
          data: barArrivals,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderWidth: 1,
        },
        {
          label: "Departures",
          data: barDepartures,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.8)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: { legend: { position: "top" } },
      scales: {
        x: { stacked: true, title: { display: true, text: "Age Group" } },
        y: { stacked: true, title: { display: true, text: "Total Estimate" } },
      },
    },
  });
};

// --- Chart Manager ---
const chartManager = {
  charts: [], // Store references to all chart instances
  addChart(chartInstance) {
    this.charts.push(chartInstance);
  },
  updateCharts(filteredData) {
    this.charts.forEach((chart) => {
      chart.update(filteredData);
    });
  },
  destroyAllCharts() {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  },
};

// --- Initialize Charts ---
const initializeCharts = (dataset) => {
  const filters = {
    startDate: "2019-06",
    endDate: "2024-06",
    selectedGender: "All",
    selectedAgeGroup: "All",
    selectedDirection: "All",
  };

  const filteredData = filterDataset(dataset, filters);

  // Initialize line chart
  const lineChartCtx = document.getElementById("lineChart").getContext("2d");
  const lineChart = plotLineChart(lineChartCtx, filteredData);
  chartManager.addChart(lineChart);

  // Initialize bar chart
  const barChartCtx = document.getElementById("stackedBarChart").getContext("2d");
  const barChart = plotBarChart(barChartCtx, filteredData);
  chartManager.addChart(barChart);
};

// --- Handle Filter Changes ---
document.getElementById("filterButton").addEventListener("click", () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const selectedGender = document.getElementById("genderFilter").value;
  const selectedAgeGroup = document.getElementById("ageGroupFilter").value;
  const selectedDirection = document.getElementById("directionFilter").value;

  const filters = { startDate, endDate, selectedGender, selectedAgeGroup, selectedDirection };
  console.log("Applying Filters:", filters);

  const filteredData = filterDataset(dataset, filters);

  // Destroy existing charts
  chartManager.destroyAllCharts();

  // Recreate charts with the new filtered data
  const lineChartCtx = document.getElementById("lineChart").getContext("2d");
  const lineChart = plotLineChart(lineChartCtx, filteredData);
  chartManager.addChart(lineChart);

  const barChartCtx = document.getElementById("stackedBarChart").getContext("2d");
  const barChart = plotBarChart(barChartCtx, filteredData);
  chartManager.addChart(barChart);
});

// --- Initial Render ---
initializeCharts(dataset);
