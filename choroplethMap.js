import { d3ColorLegend } from "./d3-color-legend.js";

choroplethMap().catch(console.error);

async function choroplethMap() {
  /**
   * topology data
   * @type {{
   *   objects: {
   *     counties: object,
   *     nation: object,
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
   *   state: string,
   * }]}
   */
  const education = await d3.json(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
  );

  const margin = { top: 100, right: 20, bottom: 20, left: 20 };
  const width = 975 + margin.right + margin.left;
  const height = 610 + margin.top + margin.bottom;
  const educationDomain = d3.extent(education.map(d => d.bachelorsOrHigher));
  const color = d3.scaleQuantize(educationDomain, d3.schemeBuGn[9]);

  const root = d3.select("#root");

  const svg = root.append("svg")
    .attr("width", width)
    .attr("height", height)
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

  const legend = await d3ColorLegend.value("legend");
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
  const countyName = new Map(education.map(d => [d.fips, d.area_name]));
  const tooltip = tooltipFactory(
    root,
    "data-education",
    d => educationLevel.get(d.id),
    d => `${countyName.get(d.id)}<br>${(educationLevel.get(d.id))}%`,
  );
  tooltip().attr("id", "tooltip");
  const path = d3.geoPath();
  const interiorBorders = (a, b) => (a !== b);
  const stroke = "#555555";

  const map = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  map.selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => educationLevel.get(d.id))
    .attr("fill", d => color(educationLevel.get(d.id)))
    .attr("d", path)
    .on("mouseover", tooltip.show)
    .on("mouseout", tooltip.hide);

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

  function tooltipFactory(
    selection,
    dataName,
    dataValueFn,
    htmlContentFn,
    left = 20,
    top = 20,
  ) {
    const div = selection.append("div")
      .style("position", "absolute")
      .style("z-index", 10)
      .style("display", "none");

    const tooltip = () => div;

    tooltip.show = (event, data) => {
      div.attr(dataName, dataValueFn(data))
        .html(htmlContentFn(data))
        .style("left", `${(event.pageX + left)}px`)
        .style("top", `${(event.pageY + top)}px`)
        .style("display", "block");
    };

    tooltip.hide = () => div.style("display", "none");

    return tooltip;
  }
}
