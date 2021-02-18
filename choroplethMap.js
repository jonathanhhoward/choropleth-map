choroplethMap().catch(console.error);

async function choroplethMap() {
  /**
   * topojson data
   * @type {{
   *   objects: {
   *     counties: object,
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
    .attr("fill", "none")
    .attr("stroke", "#333333")
    .attr("stroke-width", "0.2")
    .attr("d", d3.geoPath());
}
