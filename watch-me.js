WatchMe = {
  initial: {
    diameter: 300
  }
};

WatchMe.padLeft = function (x, padCharacter, length) {
  var s = '' + x,
      parts = [];
  for (var i = s.length; i < length; ++i) {
    parts.push(padCharacter);
  }
  parts.push(s);
  return parts.join('');
};

WatchMe.cachedTextMeasurements = {};

WatchMe.measureText = function (text, font, fontSize) {
  var cache = WatchMe.cachedTextMeasurements;
  if (cache[font] !== undefined && cache[font][text] !== undefined) {
    return cache[font][text];
  }
  var canvas = WatchMe.canvas.measure,
      context = WatchMe.context.measure;
  if (context.font != font) {
    context.font = font;
  }
  var width = Math.ceil(context.measureText(text).width);
  if (canvas.width < width) {
    canvas.width = width;
    context.font = font;
  }
  if (canvas.height < 2 * fontSize) {
    canvas.height = 2 * fontSize;
    context.font = font;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  var height = canvas.height;
  context.fillText(text, 0, height / 2);
  var data = context.getImageData(0, 0, width, height).data,
      xMin, xMax, yMin, yMax;
  console.log(width, height, data.length);
  for (var x = 0; x < width; ++x) {
    for (var y = 0; y < height; ++y) {
      var i = 4 * (y * width + x),
          r = data[i],
          g = data[i + 1],
          b = data[i + 2],
          a = data[i + 3];
      if (a == 0) {
        continue;
      }
      if (xMin === undefined) {
        xMin = xMax = x;
        yMin = yMax = y;
      } else {
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
      }
    }
  }
  console.log(xMin, yMin, xMax, yMax, text, font);
  context.fillStyle = '#bbb';
  context.fillRect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
  context.fillStyle = '#000';
  context.fillText(text, 0, height / 2);
  if (cache[font] === undefined) {
    cache[font] = {};
  }
  cache[font][text] = {
    xMin: xMax, xMax: xMax, yMin: yMin, yMax: yMax
  };
  return cache[font][text];
};

WatchMe.update = function () {
  var date = new Date(),
      hour = date.getHours() % 12,
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds();

  // Textual time check.
  var hourText = (hour == 0 ? 12: hour) + '',
      minuteText = WatchMe.padLeft(minute, '0', 2),
      secondText = WatchMe.padLeft(second, '0', 2);
  WatchMe.display.timeCheck.innerHTML =
      [ hourText, minuteText, secondText ].join(':');

  // Draw background graphics.
  var context = WatchMe.context.watch,
      radius = WatchMe.radius,
      center = { x: radius, y: radius };
      thickness = 1;
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.lineWidth = thickness;

  var hourRadius = 0.20 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.16 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius,
      secondRadius = 0.12 * radius,
      secondDistance = minuteDistance - minuteRadius - secondRadius;

  var paintArc = function (value, valueText, hertz, handDistance, handRadius,
        edgeProportion, circleColor, arcColor) {
    var angle = -Math.PI / 2 + value * 2 * Math.PI / hertz;
    thickness = edgeProportion * 2 * handRadius;
    // Background circle.
    context.lineWidth = thickness;
    context.beginPath();
    context.strokeStyle = circleColor;
    context.arc(center.x, center.y, handDistance + handRadius - thickness / 2,
        0, 2 * Math.PI);
    context.stroke();
    // Foreground arc.
    context.beginPath();
    context.strokeStyle = arcColor;
    context.arc(center.x, center.y, handDistance + handRadius - thickness / 2,
        angle - Math.PI / hertz, angle + Math.PI / hertz);
    context.stroke();
    // Value position.
    context.beginPath();
    context.lineWidth = 1;
    context.fillStyle = '#e8e8e8';
    var x = center.x + Math.cos(angle) * (handDistance - thickness / 2),
        y = center.y + Math.sin(angle) * (handDistance - thickness / 2);
    context.arc(x, y, handRadius - thickness / 2, 0, 2 * Math.PI);
    context.lineWidth = 1;
    context.fill();
    // Value text.
    context.fillStyle = '#444';
    var fontSize = Math.round(2 * handRadius - thickness),
        font = fontSize + 'px sans-serif';
    context.font = font;
    var width = context.measureText(valueText).width;
    WatchMe.measureText(valueText, font, fontSize);
    context.fillText(valueText, x - width / 2, y + handRadius - thickness / 2);
  };
  paintArc(hour, hourText, 12, hourDistance, hourRadius,
      0.105, '#f4f4f4', '#888');
  WatchMe.stopped = true;
  return;
  paintArc(minute, minuteText, 60, minuteDistance, minuteRadius,
      0.135, '#f4f4f4', '#666');
  paintArc(second, secondText, 60, secondDistance, secondRadius,
      0.165, '#f4f4f4', '#444');

  if (WatchMe.stopped) {
    return;
  }
  window.requestAnimationFrame(WatchMe.update);
};

WatchMe.load = function () {
  WatchMe.display = {
    timeCheck: document.getElementById('timeCheck')
  };
  WatchMe.canvas = {
    watch: document.createElement('canvas'),
    measure: document.createElement('canvas')
  };
  var canvas = WatchMe.canvas.watch,
      diameter = WatchMe.diameter = WatchMe.initial.diameter,
      radius = WatchMe.radius = diameter / 2;
  document.getElementById('watchContainer').appendChild(canvas);
  canvas.width = diameter;
  canvas.height = diameter;
  WatchMe.context = {
    watch: canvas.getContext('2d'),
    measure: WatchMe.canvas.measure.getContext('2d')
  };
  var measureCanvas = WatchMe.canvas.measure;
  measureCanvas.width = measureCanvas.height = 10;
  measureCanvas.style.border = '1px dotted #ccc';
  document.getElementById('wrapper').appendChild(measureCanvas);
  document.getElementById('stopButton').onmousedown = function () {
    WatchMe.stopped = true;
  };
  window.requestAnimationFrame(WatchMe.update);
};

window.onload = WatchMe.load;
