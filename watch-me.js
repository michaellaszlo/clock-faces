WatchMe = {
  initial: {
    diameter: 300
  },
  textMaker: {
    hour: function (hour) {
      return (hour == 0 ? 12: hour) + '';
    },
    minute: function (minute) {
      return WatchMe.padLeft(minute, '0', 2);
    },
    second: function (second) {
      return WatchMe.padLeft(second, '0', 2);
    }
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
  var height = canvas.height,
      xFill = 0,
      yFill = height / 2;
  context.fillText(text, xFill, yFill);
  var data = context.getImageData(0, 0, width, height).data,
      xMin, xMax, yMin, yMax;
  for (var x = 0; x < width; ++x) {
    for (var y = 0; y < height; ++y) {
      var i = 4 * (y * width + x);
      if (data[i + 3] == 0) {
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
  var x0 = (xMin + xMax) / 2,
      y0 = (yMin + yMax) / 2,
      radiusSquared = 0;
  for (var x = xMin; x <= xMax; ++x) {
    for (var y = yMin; y <= yMax; ++y) {
      var i = 4 * (y * width + x);
      if (data[i + 3] == 0) {
        continue;
      }
      var dx = Math.abs(x - x0) + 1,
          dy = Math.abs(y - y0) + 1;
      radiusSquared = Math.max(radiusSquared, dx * dx + dy * dy);
    }
  }
  var radius = Math.ceil(Math.sqrt(radiusSquared));
  context.fillStyle = '#ccc';
  context.beginPath();
  context.arc(x0, y0, radius, 0, 2 * Math.PI);
  context.fill();
  context.fillStyle = '#000';
  context.fillText(text, 0, height / 2);
  if (cache[font] === undefined) {
    cache[font] = {};
  }
  var measurement = cache[font][text] = {
    xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax,
    radius: radius,
    fillCenter: {
      x: x0 - xFill,
      y: y0 - yFill
    }
  };
  return measurement;
};

WatchMe.update = function () {
  var date = new Date(),
      hour = date.getHours() % 12,
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds();

  // Draw background graphics.
  var context = WatchMe.context.watch,
      radius = WatchMe.radius,
      center = { x: radius, y: radius };
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.beginPath();
  context.fillStyle = '#aaa';
  context.arc(center.x, center.y, 0.015 * radius, 0, 2 * Math.PI);
  context.fill();

  var gap = 0.01 * radius,
      hourRadius = 0.21 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.18 * radius,
      minuteDistance = hourDistance - gap - hourRadius - minuteRadius,
      secondRadius = 0.085 * radius,
      secondDistance = minuteDistance - gap - minuteRadius - secondRadius;
  /*
  var secondRadius = 0.20 * radius,
      secondDistance = radius - secondRadius,
      minuteRadius = 0.20 * radius,
      minuteDistance = secondDistance - secondRadius - minuteRadius,
      hourRadius = 0.20 * radius,
      hourDistance = 0;
  */

  var paintArc = function (value, textMaker, hertz, distance, radius,
        color, discColor) {
    var angle = -Math.PI / 2 + value * 2 * Math.PI / hertz,
        text = textMaker(value);
    // Value position.
    var x = center.x + Math.cos(angle) * distance,
        y = center.y + Math.sin(angle) * distance;
    // Value text.
    var fontSize = 1.33 * radius,
        font = fontSize + 'px sans-serif';
    context.font = font;
    var m = WatchMe.measureText(text, font, fontSize);
    if (discColor) {
      context.fillStyle = discColor;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
    }
    context.fillStyle = color;
    context.fillText(text, x - m.fillCenter.x, y - m.fillCenter.y);
  };
  for (var h = 0; h < 12; ++h) {
    if (h == hour) {
      paintArc(h, WatchMe.textMaker.hour, 12,
          hourDistance, hourRadius, '#fff', '#444');
    } else {
      paintArc(h, WatchMe.textMaker.hour, 12, hourDistance, hourRadius, '#aaa');
    }
  }
  paintArc(minute, WatchMe.textMaker.minute, 60,
      minuteDistance, minuteRadius, '#fff', '#666');
  paintArc(second, WatchMe.textMaker.second, 60,
      secondDistance, secondRadius, '#fff', '#888');

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
  document.getElementById('stopButton').onmousedown = function () {
    WatchMe.stopped = true;
  };
  window.requestAnimationFrame(WatchMe.update);
};

window.onload = WatchMe.load;
