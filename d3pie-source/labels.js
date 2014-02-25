// --------- labels.js -----------
d3pie.labels = {

	/**
	 * Add the labels to the pie.
	 * @param options
	 * @private
	 */
	addOuter: function() {
		var addMainLabel  = false;
		var addValue      = false;
		var addPercentage = false;

		switch (_options.labels.outside) {
			case "label":
				addMainLabel = true;
				break;
			case "value":
				addValue = true;
				break;
			case "percentage":
				addPercentage = true;
				break;
			case "label-value1":
			case "label-value2":
				addMainLabel = true;
				addValue = true;
				break;
			case "label-percentage1":
			case "label-percentage2":
				addMainLabel = true;
				addPercentage = true;
				break;
		}

		console.log(_options.labels);

		var labelGroup = _svg.selectAll(".labelGroup")
			.data(
				_options.data.filter(function(d) { return d.value; }),
				function(d) { return d.label; }
			)
			.enter()
			.append("g")
			.attr("class", "labelGroup")
			.attr("id", function(d, i) { return "labelGroup" + i; })
			.attr("transform", d3pie.math.getPieTranslateCenter);

		// 1. Add the main label
		if (addMainLabel) {
			labelGroup.append("text")
				.attr("class", "segmentOuterLabel")
				.attr("id", function(d, i) { return "label" + i; })
				.text(function(d) { return d.label; })
				.style("font-size", _options.labels.mainLabel.fontSize)
				.style("font-family", _options.labels.mainLabel.font)
				.style("fill", _options.labels.mainLabel.color)
				.style("opacity", 0);
		}

		// 2. Add the percentage label
		if (addPercentage) {
			labelGroup.append("text")
				.attr("class", "segmentOuterLabel")
				.attr("id", function(d, i) { return "label" + i; })
				.text(function(d) {
					return parseInt((d.value / _totalSize) * 100).toFixed(0) + "%";
				})
				.style("font-size", _options.labels.percentage.fontSize)
				.style("font-family", _options.labels.percentage.font)
				.style("fill", _options.labels.percentage.color)
				.style("opacity", 0);
		}

		// 3. Add the value label
		if (addValue) {
			labelGroup.append("text")
				.attr("class", "segmentOuterLabel")
				.attr("id", function(d, i) { return "label" + i; })
				.text(function(d) { return d.value; })
				.style("font-size", _options.percentage.fontSize)
				.style("font-family", _options.percentage.mainLabel.font)
				.style("fill", _options.percentage.mainLabel.color)
				.style("opacity", 0);
		}


		/*
		 labelGroup.append("text")
		 .text(function(d) {
		 return Math.round((d.value / _totalSize) * 100) + "%";
		 })
		 .attr("class", "pieShare")
		 .attr("transform", function(d, i) {
		 var angle = _getSegmentRotationAngle(d, i, _data, _totalSize);
		 var labelRadius = _outerRadius + 30;
		 var c = _arc.centroid(d),
		 x = c[0],
		 y = c[1],
		 h = Math.sqrt(x*x + y*y); // pythagorean theorem for hypotenuse

		 return "translate(" + (x/h * labelRadius) +  ',' + (y/h * labelRadius) +  ") rotate(" + -angle + ")";
		 })
		 .style("fill", options.labels.labelPercentageColor)
		 .style("font-size", "8pt")
		 .style("opacity", function() {
		 return (options.effects.loadEffect === "fadein") ? 0 : 1;
		 });
		 */

		// fade in the labels when the load effect is complete - or immediately if there's no load effect
		var loadSpeed = (_options.effects.load.effect === "default") ? _options.effects.load.speed : 1;
		setTimeout(function() {
			var labelFadeInTime = (_options.effects.load.effect === "default") ? _options.effects.labelFadeInTime : 1;

			// should apply to the labelGroup
			d3.selectAll("text.segmentOuterLabel")
				.transition()
				.duration(labelFadeInTime)
				.style("opacity", 1);

			// once everything's done loading, trigger the onload callback if defined
			if ($.isFunction(_options.callbacks.onload)) {
				setTimeout(function() {
					try {
						_options.callbacks.onload();
					} catch (e) { }
				}, labelFadeInTime);
			}

		}, loadSpeed);

		// now place the labels in reasonable locations. This needs to run in a timeout because we need the actual
		// text elements in place
		setTimeout(d3pie.labels.addLabelLines, 1);
	},

	addInner: function() {

	},

	// this both adds the lines and positions the labels [TODO]
	addLabelLines: function() {
		if (!_options.labels.lines.enabled || _options.labels.outside === "none") {
			return;
		}

		var lineMidPointDistance = _options.labels.lines.length - (_options.labels.lines.length / 4);
		var circleCoordGroups = [];

		d3.selectAll(".segmentOuterLabel")
			.style("opacity", 0)
			.attr("dx", function(d, i) {
				var labelDimensions = document.getElementById("label" + i).getBBox();

				var angle = d3pie.math.getSegmentRotationAngle(i, _options.data, _totalSize);
				var nextAngle = 360;
				if (i < _options.data.length - 1) {
					nextAngle = d3pie.math.getSegmentRotationAngle(i+1, _options.data, _totalSize);
				}

				var segmentCenterAngle = angle + ((nextAngle - angle) / 2);
				var remainderAngle = segmentCenterAngle % 90;
				var quarter = Math.floor(segmentCenterAngle / 90);

				var labelXMargin = 10; // the x-distance of the label from the end of the line [TODO configurable?]
				var xOffset = (_options.data[i].xOffset) ? _options.data[i].xOffset : 0;

				var p1, p2, p3, labelX;
				switch (quarter) {
					case 0:
						var calc1 = Math.sin(d3pie.math.toRadians(remainderAngle));
						labelX = calc1 * (_outerRadius + _options.labels.lines.length) + labelXMargin;
						p1     = calc1 * _outerRadius;
						p2     = calc1 * (_outerRadius + lineMidPointDistance) + xOffset;
						p3     = calc1 * (_outerRadius + _options.labels.lines.length) + 5 + xOffset;
						break;
					case 1:
						var calc2 = Math.cos(d3pie.math.toRadians(remainderAngle));
						labelX = calc2 * (_outerRadius + _options.labels.lines.length) + labelXMargin;
						p1     = calc2 * _outerRadius;
						p2     = calc2 * (_outerRadius + lineMidPointDistance) + xOffset;
						p3     = calc2 * (_outerRadius + _options.labels.lines.length) + 5 + xOffset;
						break;
					case 2:
						var calc3 = Math.sin(d3pie.math.toRadians(remainderAngle));
						labelX = -calc3 * (_outerRadius + _options.labels.lines.length) - labelDimensions.width - labelXMargin;
						p1     = -calc3 * _outerRadius;
						p2     = -calc3 * (_outerRadius + lineMidPointDistance) + xOffset;
						p3     = -calc3 * (_outerRadius + _options.labels.lines.length) - 5 + xOffset;
						break;
					case 3:
						var calc4 = Math.cos(d3pie.math.toRadians(remainderAngle));
						labelX = -calc4 * (_outerRadius + _options.labels.lines.length) - labelDimensions.width - labelXMargin;
						p1     = -calc4 * _outerRadius;
						p2     = -calc4 * (_outerRadius + lineMidPointDistance) + xOffset;
						p3     = -calc4 * (_outerRadius + _options.labels.lines.length) - 5 + xOffset;
						break;
				}
				circleCoordGroups[i] = [
					{ x: p1, y: null },
					{ x: p2, y: null },
					{ x: p3, y: null }
				];

				labelX += xOffset;
				return labelX;
			})
			.attr("dy", function(d, i) {
				var labelDimensions = document.getElementById("label" + i).getBBox();
				var heightOffset = labelDimensions.height / 5;

				var angle = d3pie.math.getSegmentRotationAngle(i, _options.data, _totalSize);
				var nextAngle = 360;
				if (i < _options.data.length - 1) {
					nextAngle = d3pie.math.getSegmentRotationAngle(i+1, _options.data, _totalSize);
				}
				var segmentCenterAngle = angle + ((nextAngle - angle) / 2);
				var remainderAngle = (segmentCenterAngle % 90);
				var quarter = Math.floor(segmentCenterAngle / 90);
				var p1, p2, p3, labelY;
				var yOffset = (_options.data[i].yOffset) ? _options.data[i].yOffset : 0;

				switch (quarter) {
					case 0:
						var calc1 = Math.cos(d3pie.math.toRadians(remainderAngle));
						labelY = -calc1 * (_outerRadius + _options.labels.lines.length);
						p1     = -calc1 * _outerRadius;
						p2     = -calc1 * (_outerRadius + lineMidPointDistance) + yOffset;
						p3     = -calc1 * (_outerRadius + _options.labels.lines.length) - heightOffset + yOffset;
						break;
					case 1:
						var calc2 = Math.sin(d3pie.math.toRadians(remainderAngle));
						labelY = calc2 * (_outerRadius + _options.labels.lines.length);
						p1     = calc2 * _outerRadius;
						p2     = calc2 * (_outerRadius + lineMidPointDistance) + yOffset;
						p3     = calc2 * (_outerRadius + _options.labels.lines.length) - heightOffset + yOffset;
						break;
					case 2:
						var calc3 = Math.cos(d3pie.math.toRadians(remainderAngle));
						labelY = calc3 * (_outerRadius + _options.labels.lines.length);
						p1     = calc3 * _outerRadius;
						p2     = calc3 * (_outerRadius + lineMidPointDistance) + yOffset;
						p3     = calc3 * (_outerRadius + _options.labels.lines.length) - heightOffset + yOffset;
						break;
					case 3:
						var calc4 = Math.sin(d3pie.math.toRadians(remainderAngle));
						labelY = -calc4 * (_outerRadius + _options.labels.lines.length);
						p1     = -calc4 * _outerRadius;
						p2     = -calc4 * (_outerRadius + lineMidPointDistance) + yOffset;
						p3     = -calc4 * (_outerRadius + _options.labels.lines.length) - heightOffset + yOffset;
						break;
				}
				circleCoordGroups[i][0].y = p1;
				circleCoordGroups[i][1].y = p2;
				circleCoordGroups[i][2].y = p3;

				labelY += yOffset;
				return labelY;
			});

		var lineGroups = _svg.insert("g", ".pieChart")
			.attr("class", "lineGroups")
			.style("opacity", 0);

		var lineGroup = lineGroups.selectAll(".lineGroup")
			.data(circleCoordGroups)
			.enter()
			.append("g")
			.attr("class", "lineGroup")
			.attr("transform", d3pie.math.getPieTranslateCenter);

		var lineFunction = d3.svg.line()
			.interpolate("basis")
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; });

		lineGroup.append("path")
			.attr("d", lineFunction)
			.attr("stroke", function(d, i) {
				var color;
				if (_options.labels.lines.color === "segment") {
					color = _options.styles.colors[i];
				} else {
					color = _options.labels.lines.color;
				}
				return color;
			})
			.attr("stroke-width", 1)
			.attr("fill", "none");

		// fade in the labels when the load effect is complete - or immediately if there's no load effect
		var loadSpeed = (_options.effects.load.effect === "default") ? _options.effects.load.speed : 1;
		setTimeout(function() {
			var labelFadeInTime = (_options.effects.load.effect === "default") ? _options.effects.labelFadeInTime : 1;
			d3.selectAll("g.lineGroups")
				.transition()
				.duration(labelFadeInTime)
				.style("opacity", 1);
		}, loadSpeed);
	}
};