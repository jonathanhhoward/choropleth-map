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
  const dataset = new Map(education.map(d => [d.fips, d.bachelorsOrHigher]));
  const educationDomain = d3.extent(education.map(d => d.bachelorsOrHigher));
  const colorScale = d3.scaleQuantize(educationDomain, d3.schemeBuGn[9]);
  const path = d3.geoPath();
  const interiorBorders = (a, b) => (a !== b);
  const countyStrokeWidth = 0.1;
  const stateStrokeWidth = 0.25;
  const stroke = "#555555";

  const svg = d3.select("#root").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "centered");

  const map = svg.append("g");

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
