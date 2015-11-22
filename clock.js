Clock = {
  initial: {
    diameter: 300
  },
  textMaker: {
    hour: function (hour) {
      return (hour == 0 ? 12: hour) + '';
    },
    minute: function (minute) {
      return Clock.padLeft(minute, '0', 2);
    },
    second: function (second) {
      return Clock.padLeft(second, '0', 2);
    }
  }
};

Clock.padLeft = function (x, padCharacter, length) {
  var s = '' + x,
      parts = [];
  for (var i = s.length; i < length; ++i) {
    parts.push(padCharacter);
  }
  parts.push(s);
  return parts.join('');
};

Clock.measure = {};

Clock.measure.cache = {};

Clock.measure.text = function (text, font, fontSize) {
  var cache = Clock.measure.cache;
  if (cache[font] !== undefined && cache[font][text] !== undefined) {
    return cache[font][text];
  }
  var canvas = Clock.measure.canvas,
      context = Clock.measure.context;
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

Clock.bubbleClock = {};

Clock.bubbleClock.update = function (hour, minute, second) {
  // Draw background graphics.
  var context = Clock.bubbleClock.context,
      radius = Clock.radius,
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
    var m = Clock.measure.text(text, font, fontSize);
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
      paintArc(h, Clock.textMaker.hour, 12,
          hourDistance, hourRadius, '#fff', '#444');
    } else {
      paintArc(h, Clock.textMaker.hour, 12, hourDistance, hourRadius, '#aaa');
    }
  }
  paintArc(minute, Clock.textMaker.minute, 60,
      minuteDistance, minuteRadius, '#fff', '#666');
  paintArc(second, Clock.textMaker.second, 60,
      secondDistance, secondRadius, '#fff', '#888');
};

Clock.update = function () {
  var date = new Date(),
      hour = date.getHours() % 12,
      minute = date.getMinutes(),
      second = date.getSeconds();

  Clock.bubbleClock.update(hour, minute, second);

  if (Clock.stopped) {
    return;
  }
  window.requestAnimationFrame(Clock.update);
};

Clock.load = function () {
  Clock.measure.canvas = document.createElement('canvas');
  Clock.measure.context = Clock.measure.canvas.getContext('2d');

  var diameter = Clock.diameter = Clock.initial.diameter;
  Clock.radius = diameter / 2;

  var container = document.getElementById('watchContainer');

  [ Clock.bubbleClock ].forEach(function (clock) {
    var canvas = document.createElement('canvas');
    canvas.width = diameter;
    canvas.height = diameter;
    clock.canvas = canvas;
    clock.context = canvas.getContext('2d');
    container.appendChild(canvas);
  });

  document.getElementById('stopButton').onmousedown = function () {
    Clock.stopped = true;
  };
  window.requestAnimationFrame(Clock.update);
};

window.onload = Clock.load;
