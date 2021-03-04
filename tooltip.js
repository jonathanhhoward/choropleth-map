export class Tooltip {
  constructor(
    selection,
    dataName,
    dataValueFn,
    htmlContentFn,
    dx = 20,
    dy = 20,
  ) {
    this.div = selection.append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("z-index", 10)
      .style("display", "none");
    this.dataName = dataName;
    this.dataValueFn = dataValueFn;
    this.htmlContentFn = htmlContentFn;
    this.dx = dx;
    this.dy = dy;
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show(event, data) {
    this.div.attr(this.dataName, this.dataValueFn(data))
      .html(this.htmlContentFn(data))
      .style("left", `${event.pageX + this.dx}px`)
      .style("top", `${event.pageY + this.dy}px`)
      .style("display", "block");
  };

  hide() {
    this.div.style("display", "none");
  };
}
