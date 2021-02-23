import { Runtime } from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import d3ColorLegend from "https://api.observablehq.com/@d3/color-legend.js?v=3";

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
   *   area_name: string,
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
  const color = d3.scaleQuantize(educationDomain, d3.schemeBuGn[9]);

  const root = d3.select("#root");

  const svg = root.append("svg")
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
    .join("text")
    .attr("id", d => d.id)
    .attr("x", width * 0.5)
    .attr("y", d => d.y)
    .text(d => d.text);

  const colorLegendNotebook = new Runtime().module(d3ColorLegend);
  const legend = await colorLegendNotebook.value("legend");
  const legendWidth = 300;

  svg.append("g")
    .attr(
      "transform",
      `translate(${(width / 2) - (legendWidth / 2)}, ${margin.top})`,
    )
    .attr("id", "legend")
    .append(() => legend({
      color,
      title: "Bachelors Or Higher (%)",
      width: legendWidth,
      height: 42,
      marginTop: 10,
      tickFormat: d3.format(".0f"),
    }));

  const educationLevel = new Map(education.map(d => [
    d.fips,
    d.bachelorsOrHigher,
  ]));
  const path = d3.geoPath();
  const interiorBorders = (a, b) => (a !== b);
  const stroke = "#555555";

  const map = svg.append("g")
    .attr("transform", `translate(0, ${margin.top})`);

  map.selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => educationLevel.get(d.id))
    .attr("fill", d => color(educationLevel.get(d.id)))
    .attr("d", path)
    .on("mouseover", showTooltip)
    .on("mouseout", hideTooltip);

  map.append("path")
    .datum(topojson.mesh(us, us.objects.counties, interiorBorders))
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", 0.1)
    .attr("d", path);

  map.append("path")
    .datum(topojson.mesh(us, us.objects.states, interiorBorders))
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", 0.25)
    .attr("d", path);

  const countyName = new Map(education.map(d => [d.fips, d.area_name]));

  const tooltip = root.append("div")
    .attr("id", "tooltip");

  function showTooltip(event, data) {
    tooltip.attr("data-education", educationLevel.get(data.id))
      .html(`${countyName.get(data.id)}<br>${(educationLevel.get(data.id))}%`)
      .style("left", `${(event.pageX + 20)}px`)
      .style("top", `${(event.pageY - 40)}px`)
      .style("display", "block");
  }

  function hideTooltip() {
    tooltip.style("display", "none");
  }
}
