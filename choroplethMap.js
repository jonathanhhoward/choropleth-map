choroplethMap().catch(console.error);

async function choroplethMap() {
  /**
   * topojson data
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

  const dataset = new Map(education.map(d => [d.fips, d.bachelorsOrHigher]));
  const educationDomain = d3.extent(education.map(d => d.bachelorsOrHigher));
  const colorScale = d3.scaleQuantize(educationDomain, d3.schemeBuGn[9]);

  const svg = d3.select("#root").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

  const map = svg.append("g");

  map.selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => dataset.get(d.id))
    .attr("fill", d => colorScale(dataset.get(d.id)))
    .attr("stroke", "#ffffff")
    .attr("stroke-width", "0.1")
    .attr("d", d3.geoPath());

  map.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("fill", "none")
    .attr("stroke", "#000000")
    .attr("stroke-width", "0.1")
    .attr("d", d3.geoPath());
}
