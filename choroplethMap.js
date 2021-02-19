choroplethMap().catch(console.error);

async function choroplethMap() {
  /**
   * topology data
   * @type {{
   *   objects: {
   *     counties: object,
   *     states: object,
   *   },
   * }}
   */
  const us = await d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json",
  );

  /**
   * education data
   * @type {[{
   *   bachelorsOrHigher: number,
   *   fips: number,
   * }]}
   */
  const education = await d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
  );

  const width = 975;
  const height = 610;
  const margin = { top: 100, right: 0, bottom: 0, left: 0 };
  const educationDomain = d3.extent(education.map(d => d.bachelorsOrHigher));
  const colorScale = d3.scaleQuantize(educationDomain, d3.schemeBuGn[9]);

  const svg = d3.select("#root").append("svg")
    .attr("width", width)
    .attr("height", height + margin.top)
    .attr("class", "centered");

  svg.selectAll("text")
    .data([
      {
        id: "title",
        text: "United States Educational Attainment",
        y: margin.top * 0.5,
      },
      {
        id: "description",
        text: `Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)`,
        y: margin.top * 0.75,
      },
    ])
    .enter()
    .append("text")
    .attr("id", d => d.id)
    .attr("x", width * 0.5)
    .attr("y", d => d.y)
    .text(d => d.text);

  const legendWidth = 300;
  const legendHeight = 8;

  const legend = svg.append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      `translate(${(width / 2) - (legendWidth / 2)}, ${margin.top})`,
    );

  const legendData = colorScale.thresholds();

  const legendScale = d3.scaleBand()
    .domain(legendData)
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickFormat(d => `${d3.format(".1f")(d)}%`)
    .tickSizeOuter(0);

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis)
    .call(g => g.select(".domain").remove());

  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", d => legendScale(d))
    .attr("y", 0)
    .attr("width", legendScale.bandwidth())
    .attr("height", legendHeight)
    .attr("fill", d => colorScale(d));

  const dataset = new Map(education.map(d => [d.fips, d.bachelorsOrHigher]));
  const path = d3.geoPath();
  const interiorBorders = (a, b) => (a !== b);
  const countyStrokeWidth = 0.1;
  const stateStrokeWidth = 0.25;
  const stroke = "#555555";

  const map = svg.append("g")
    .attr("transform", `translate(0, ${margin.top})`);

  map.selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => dataset.get(d.id))
    .attr("fill", d => colorScale(dataset.get(d.id)))
    .attr("d", path);

  map.append("path")
    .datum(topojson.mesh(us, us.objects.counties, interiorBorders))
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", countyStrokeWidth)
    .attr("d", path);

  map.append("path")
    .datum(topojson.mesh(us, us.objects.states, interiorBorders))
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", stateStrokeWidth)
    .attr("d", path);
}
