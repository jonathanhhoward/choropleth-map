choroplethMap().catch(console.error);

async function choroplethMap() {
  const us = await d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  );

  const svg = d3.select("#root").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

  const map = svg.append("g");

  map.selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("fill", "none")
    .attr("stroke", "#333333")
    .attr("stroke-width", "0.2")
    .attr("d", d3.geoPath());
}
