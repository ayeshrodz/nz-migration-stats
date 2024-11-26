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

// --- Function to Update Dashboard Cards ---
const updateDashboardCards = (filteredData) => {
  const totalArrivals = filteredData.estimate
    .filter((_, i) => filteredData.direction[i] === "Arrivals")
    .reduce((sum, val) => sum + val, 0);

  const totalDepartures = filteredData.estimate
    .filter((_, i) => filteredData.direction[i] === "Departures")
    .reduce((sum, val) => sum + val, 0);

  const netMigration = totalArrivals - totalDepartures;
  const averageMigration =
    filteredData.estimate.length > 0
      ? (totalArrivals + totalDepartures) / filteredData.estimate.length
      : 0;

  // Update the card values dynamically
  document.getElementById("totalArrivals").textContent = totalArrivals.toLocaleString();
  document.getElementById("totalDepartures").textContent = totalDepartures.toLocaleString();
  document.getElementById("netMigration").textContent = netMigration.toLocaleString();
  document.getElementById("averageMigration").textContent = averageMigration.toFixed(2);
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

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Arrivals",
          data: arrivalData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Departures",
          data: departureData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        x: { title: { display: true, text: "Month" } },
        y: { title: { display: true, text: "Estimate" } },
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
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Departures",
          data: barDepartures,
          backgroundColor: "rgba(255, 99, 132, 0.8)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      indexAxis: "y",
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        x: {
          stacked: true, // Ensures the bars are stacked horizontally
          title: { display: true, text: "Age Group" },
        },
        y: {
          stacked: true, // Ensures the bars are stacked vertically
          title: { display: true, text: "Total Estimate" },
        },
      },
    },
  });
};


// --- Chart Manager ---
const chartManager = {
  charts: [],
  addChart(chartInstance) {
    this.charts.push(chartInstance);
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

  // Initialize charts
  const lineChartCtx = document.getElementById("lineChart").getContext("2d");
  chartManager.addChart(plotLineChart(lineChartCtx, filteredData));

  const barChartCtx = document.getElementById("stackedBarChart").getContext("2d");
  chartManager.addChart(plotBarChart(barChartCtx, filteredData));

  // Update dashboard cards
  updateDashboardCards(filteredData);
};

// --- Handle Filter Changes ---
document.getElementById("filterButton").addEventListener("click", () => {
  const filters = {
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    selectedGender: document.getElementById("genderFilter").value,
    selectedAgeGroup: document.getElementById("ageGroupFilter").value,
    selectedDirection: document.getElementById("directionFilter").value,
  };

  const filteredData = filterDataset(dataset, filters);

  // Destroy existing charts
  chartManager.destroyAllCharts();

  // Recreate charts with the new filtered data
  const lineChartCtx = document.getElementById("lineChart").getContext("2d");
  chartManager.addChart(plotLineChart(lineChartCtx, filteredData));

  const barChartCtx = document.getElementById("stackedBarChart").getContext("2d");
  chartManager.addChart(plotBarChart(barChartCtx, filteredData));

  // Update dashboard cards
  updateDashboardCards(filteredData);
});

// --- Initial Render ---
initializeCharts(dataset);
