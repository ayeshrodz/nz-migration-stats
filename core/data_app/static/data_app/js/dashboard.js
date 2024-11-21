// Initialize the chart
const ctx = document.getElementById("lineChart").getContext("2d");
let lineChart = null;

const plotGraph = (
  data,
  startDate,
  endDate,
  selectedGender,
  selectedAgeGroup,
  selectedDirection
) => {
  // Filter data by the selected date range and gender
  const filteredIndices = data.year_month
    .map((ym, index) => {
      const isInDateRange = ym >= startDate && ym <= endDate;
      const isMatchingGender =
        selectedGender === "All" || data.gender[index] === selectedGender;
      const isMatchingAgeGroup =
        selectedAgeGroup === "All" ||
        data.age_group[index] === selectedAgeGroup;
      const isMatchingDirection =
        selectedDirection === "All" ||
        data.direction[index] === selectedDirection;

      return isInDateRange &&
        isMatchingGender &&
        isMatchingAgeGroup &&
        isMatchingDirection
        ? index
        : null;
    })
    .filter((index) => index !== null);

  const filteredData = {
    year_month: filteredIndices.map((i) => data.year_month[i]),
    direction: filteredIndices.map((i) => data.direction[i]),
    estimate: filteredIndices.map((i) => data.estimate[i]),
  };

  // Aggregate data for arrivals and departures
  const arrivals = {};
  const departures = {};
  filteredData.year_month.forEach((ym, i) => {
    if (!arrivals[ym]) arrivals[ym] = 0;
    if (!departures[ym]) departures[ym] = 0;
    if (filteredData.direction[i] === "Arrivals")
      arrivals[ym] += filteredData.estimate[i];
    if (filteredData.direction[i] === "Departures")
      departures[ym] += filteredData.estimate[i];
  });

  const labels = Object.keys(arrivals).sort();
  const arrivalData = labels.map((ym) => arrivals[ym]);
  const departureData = labels.map((ym) => departures[ym]);

  // Create or update the chart
  if (lineChart) {
    lineChart.data.labels = labels; // year_month for tooltips
    lineChart.data.datasets[0].data = arrivalData;
    lineChart.data.datasets[1].data = departureData;
    lineChart.update();
  } else {
    lineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels, // year_month for tooltips
        datasets: [
          {
            label: "Arrivals",
            data: arrivalData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
          },
          {
            label: "Departures",
            data: departureData,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                // Return the corresponding year_month for the hovered point
                return tooltipItems[0].label;
              },
              label: (tooltipItem) => {
                // Customize the value displayed in the tooltip
                const value = tooltipItem.raw;
                return `${
                  tooltipItem.dataset.label
                }: ${value.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: labels.length <= 12 ? "Month" : "Year",
            },
          },
          y: {
            title: {
              display: true,
              text: "Estimate",
            },
          },
        },
      },
    });
  }
};

// Initial plot with full dataset
plotGraph(dataset, "2001-01", "2024-06", "All", "All", "All");

// Filter button click event
document.getElementById("filterButton").addEventListener("click", () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const selectedGender = document.getElementById("genderFilter").value;
  const selectedAgeGroup = document.getElementById("ageGroupFilter").value;
  const selectedDirection = document.getElementById("directionFilter").value;

  console.log("Filters:", {
    startDate,
    endDate,
    selectedGender,
    selectedAgeGroup,
    selectedDirection,
  });

  // Pass the selected age group to the plotGraph function
  plotGraph(
    dataset,
    startDate,
    endDate,
    selectedGender,
    selectedAgeGroup,
    selectedDirection
  );
});
