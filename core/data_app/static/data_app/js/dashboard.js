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
    gender: filteredIndices.map((i) => data.gender[i]),
  };
};

// --- Function to Update Dashboard Cards ---
const updateDashboardCards = (filteredData) => {
  const monthlyNetMigrations = {};

  // Calculate net migration per month
  filteredData.year_month.forEach((ym, i) => {
    if (!monthlyNetMigrations[ym]) monthlyNetMigrations[ym] = 0;
    if (filteredData.direction[i] === "Arrivals") {
      monthlyNetMigrations[ym] += filteredData.estimate[i];
    } else if (filteredData.direction[i] === "Departures") {
      monthlyNetMigrations[ym] -= filteredData.estimate[i];
    }
  });

  // Calculate total net migration and average net migration
  const netMigrationValues = Object.values(monthlyNetMigrations);
  const totalNetMigration = netMigrationValues.reduce((sum, val) => sum + val, 0);
  const averageNetMigration = netMigrationValues.length > 0
    ? Math.round(totalNetMigration / netMigrationValues.length) // Rounded to whole number
    : 0;

  // Update the cards
  const totalArrivals = filteredData.estimate
    .filter((_, i) => filteredData.direction[i] === "Arrivals")
    .reduce((sum, val) => sum + val, 0);

  const totalDepartures = filteredData.estimate
    .filter((_, i) => filteredData.direction[i] === "Departures")
    .reduce((sum, val) => sum + val, 0);

  document.getElementById("totalArrivals").textContent = totalArrivals.toLocaleString();
  document.getElementById("totalDepartures").textContent = totalDepartures.toLocaleString();
  document.getElementById("netMigration").textContent = totalNetMigration.toLocaleString();
  document.getElementById("averageMigration").textContent = averageNetMigration.toLocaleString();
};

const plotMigrationDirectionDoughnutChart = (ctx, data) => {
  // Calculate total arrivals and departures
  const directionStats = { Arrivals: 0, Departures: 0 };

  data.direction.forEach((direction, i) => {
    if (direction === "Arrivals") {
      directionStats["Arrivals"] += data.estimate[i];
    } else if (direction === "Departures") {
      directionStats["Departures"] += data.estimate[i];
    }
  });

  const totalStat = Object.values(directionStats).reduce((sum, val) => sum + val, 0);

  // Calculate net migration percentage (+/-)
  const netMigrationPercentage = (
    ((directionStats.Arrivals - directionStats.Departures) / totalStat) *
    100
  ).toFixed(1);

  // Update the net migration percentage dynamically
  const statsValueElement = document.getElementById("netMigrationPercentage");
  if (statsValueElement) {
    statsValueElement.textContent = `${netMigrationPercentage > 0 ? "+" : ""
      }${netMigrationPercentage}%`;

    // Apply dynamic styles for green/red based on the percentage value
    statsValueElement.style.color = netMigrationPercentage > 0 ? "green" : "red";
  }

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(directionStats), // ["Arrivals", "Departures"]
      datasets: [
        {
          label: "Migration by Direction",
          data: Object.values(directionStats), // [Total Arrivals, Total Departures]
          backgroundColor: ["rgba(75, 192, 192, 0.8)", "rgba(255, 99, 132, 0.8)"], // Colors for the doughnut chart
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }, // Legend position
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              // Add a percentage to the tooltip
              const value = tooltipItem.raw;
              const percentage = ((value / totalStat) * 100).toFixed(1); // Calculate percentage
              return `${tooltipItem.label}: ${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
        datalabels: {
          color: "#fff", // Text color
          formatter: (value, context) => {
            const percentage = ((value / totalStat) * 100).toFixed(1); // Calculate percentage
            return `${percentage}%`; // Display percentage inside the chart
          },
          font: {
            weight: "bold",
          },
        },
      },
    },
    plugins: [ChartDataLabels], // Enable DataLabels plugin
  });
};



const plotGenderPieChart = (ctx, data) => {
  // Aggregate total estimates for arrivals and departures by gender
  const genderArrivals = {
    Male: 0,
    Female: 0,
  };

  const genderDepartures = {
    Male: 0,
    Female: 0,
  };

  data.gender.forEach((gender, i) => {
    if (gender === "Male" || gender === "Female") {
      if (data.direction[i] === "Arrivals") {
        genderArrivals[gender] += data.estimate[i];
      } else if (data.direction[i] === "Departures") {
        genderDepartures[gender] += data.estimate[i];
      }
    }
  });

  // Calculate totals
  const totalMale = genderArrivals.Male + genderDepartures.Male;
  const totalFemale = genderArrivals.Female + genderDepartures.Female;
  const total = totalMale + totalFemale;

  // Update text inside the chart card
  const summaryText = `Males: ${(totalMale / total * 100).toFixed(1)}% | Females: ${(totalFemale / total * 100).toFixed(1)}%`;
  document.getElementById("genderSummary").textContent = summaryText;

  // Prepare data for the pie chart
  const chartData = [
    genderArrivals.Male,
    genderDepartures.Male,
    genderArrivals.Female,
    genderDepartures.Female,
  ];

  return new Chart(ctx, {
    type: "pie",
    data: {
      labels: [
        "Male Arrivals",
        "Male Departures",
        "Female Arrivals",
        "Female Departures",
      ],
      datasets: [
        {
          data: chartData,
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)", // Green for Male Arrivals
            "rgba(255, 99, 132, 0.8)", // Rose for Male Departures
            "rgba(75, 192, 192, 0.4)", // Light Green for Female Arrivals
            "rgba(255, 99, 132, 0.4)", // Light Rose for Female Departures
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)", // Green for Male Arrivals
            "rgba(255, 99, 132, 1)", // Rose for Male Departures
            "rgba(75, 192, 192, 1)", // Light Green for Female Arrivals
            "rgba(255, 99, 132, 1)", // Light Rose for Female Departures
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const value = tooltipItem.raw;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${tooltipItem.label}: ${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
        datalabels: {
          formatter: (value, context) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`; // Display percentage on the chart
          },
          color: "#fff",
          font: {
            weight: "bold",
          },
        },
      },
    },
    plugins: [ChartDataLabels], // Enable DataLabels plugin
  });
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
        x: {
          title: { display: true, text: "Month" },
          ticks: {
            callback: function (value, index, values) {
              const dateParts = this.getLabelForValue(value).split("-"); // Split "YYYY-MM"
              const month = dateParts[1]; // Extract month (e.g., "01", "02")
              const year = dateParts[0]; // Extract year
              const date = new Date(`${year}-${month}-01`); // Create Date object

              if (values.length <= 12) {
                return new Intl.DateTimeFormat("en", { month: "short" }).format(date); // Convert format to "Jan", "Feb", etc.
              } else {
                return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date); // Format to "MMM YYYY"
              }
            },
          },

        },

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

  // Aggregate data for arrivals and departures by age group
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

  // Calculate totals for percentage calculations
  const totalByGroup = ageGroups.map((_, i) => barArrivals[i] + barDepartures[i]);

  // Check if there is only one age group
  const isSingleAgeGroup = ageGroups.length === 1;

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
      indexAxis: "y", // Makes the bars horizontal
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const value = tooltipItem.raw;
              const groupIndex = tooltipItem.dataIndex;
              const percentage = ((value / totalByGroup[groupIndex]) * 100).toFixed(1); // Calculate percentage
              return `${tooltipItem.dataset.label}: ${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
        datalabels: {
          display: isSingleAgeGroup, // Only show labels if there's one age group
          formatter: (value, context) => {
            if (isSingleAgeGroup) {
              const groupIndex = context.dataIndex;
              const total = totalByGroup[groupIndex];
              const percentage = ((value / total) * 100).toFixed(1); // Calculate percentage
              return `${percentage}%`; // Display percentage on the bar
            }
            return null; // No label otherwise
          },
          color: "#fff", // White text for contrast
          font: { weight: "bold" },
          anchor: "center", // Centers the text on the bar
          align: "center", // Centers the text on the bar
        },
      },
      scales: {
        x: {
          stacked: true, // Ensures the bars are stacked horizontally
          title: { display: true, text: "Total Estimate" },
        },
        y: {
          stacked: true, // Ensures the bars are stacked vertically
          title: { display: true, text: "Age Group" },
        },
      },
    },
    plugins: [ChartDataLabels], // Enable DataLabels plugin
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
  const lineChart = plotLineChart(lineChartCtx, filteredData);
  chartManager.addChart(lineChart);

  const barChartCtx = document.getElementById("stackedBarChart").getContext("2d");
  const barChart = plotBarChart(barChartCtx, filteredData);
  chartManager.addChart(barChart);

  // Doughnut chart (Migration by Direction)
  const doughnutChartCtx = document.getElementById("directionDoughnutChart").getContext("2d");
  const doughnutChart = plotMigrationDirectionDoughnutChart(doughnutChartCtx, filteredData);
  chartManager.addChart(doughnutChart);

  // Initialize Gender Pie Chart
  const genderPieChartCtx = document.getElementById("genderPieChart").getContext("2d");
  const genderPieChart = plotGenderPieChart(genderPieChartCtx, filteredData);
  chartManager.addChart(genderPieChart);


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

  const doughnutChartCtx = document.getElementById("directionDoughnutChart").getContext("2d");
  chartManager.addChart(plotMigrationDirectionDoughnutChart(doughnutChartCtx, filteredData));

  const genderPieChartCtx = document.getElementById("genderPieChart").getContext("2d");
  chartManager.addChart(plotGenderPieChart(genderPieChartCtx, filteredData));

  // Update dashboard cards
  updateDashboardCards(filteredData);
});

// --- Initial Render ---
initializeCharts(dataset);
