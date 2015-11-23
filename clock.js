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

// Mundane clock.
Clock.mundaneClock = {};

Clock.mundaneClock.update = function (hour, minute, second, millisecond) {
  var context = Clock.mundaneClock.context,
      radius = Clock.radius,
      center = { x: radius, y: radius };
  context.clearRect(0, 0, 2 * radius, 2 * radius);

  var tickRadius = 0.033 * radius,
      tickDistance = radius - tickRadius,
      hourRadius = 0.21 * radius,
      hourDistance = tickDistance - tickRadius - hourRadius;

  for (var i = 0; i < 60; ++i) {
    var angle = -Math.PI / 2 + i * Math.PI / 30;
    if (i % 5 == 0) {
      var x = center.x + Math.cos(angle) * hourDistance,
          y = center.y + Math.sin(angle) * hourDistance,
          fontSize = 1.33 * hourRadius,
          font = fontSize + 'px sans-serif',
          text = '' + (i == 0 ? 12 : i / 5);
      context.font = font;
      var m = Clock.measure.text(text, font, fontSize);
      context.fillStyle = '#444';
      context.fillText(text, x - m.fillCenter.x, y - m.fillCenter.y);

      context.lineWidth = 4;
      context.strokeStyle = '#222';
    } else {
      context.lineWidth = 1;
      context.strokeStyle = '#666';
    }
    var a = {
          x: center.x + Math.cos(angle) * (tickDistance - tickRadius),
          y: center.y + Math.sin(angle) * (tickDistance - tickRadius)
        },
        b = {
          x: center.x + Math.cos(angle) * (tickDistance + tickRadius),
          y: center.y + Math.sin(angle) * (tickDistance + tickRadius)
        };
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  var hourAngle = -Math.PI / 2 + Math.PI * (hour / 6 + minute / 360),
      minuteAngle = -Math.PI / 2 + (minute / 30 + second / 1800) * Math.PI,
      secondAngle = -Math.PI / 2 + (second / 30) * Math.PI,
      hourHandLength = 0.4 * radius,
      hourHandThickness = 4,
      minuteHandLength = 0.65 * radius,
      minuteHandThickness = 2.5,
      secondHandLength = 0.85 * radius,
      secondHandThickness = 1;
  context.strokeStyle = '#222';
  var paintHand = function (angle, length, thickness) {
    context.beginPath();
    context.lineWidth = thickness;
    context.moveTo(center.x + Math.cos(angle + Math.PI) * 0.06 * length,
                   center.y + Math.sin(angle + Math.PI) * 0.06 * length);
    context.lineTo(center.x + Math.cos(angle) * length,
                   center.y + Math.sin(angle) * length);
    context.stroke();
  }
  paintHand(hourAngle, hourHandLength, hourHandThickness);
  paintHand(minuteAngle, minuteHandLength, minuteHandThickness);
  paintHand(secondAngle, secondHandLength, secondHandThickness);
};

// Bubble clock.
Clock.bubbleClock = {};

Clock.bubbleClock.update = function (hour, minute, second, millisecond) {
  var context = Clock.bubbleClock.context,
      radius = Clock.radius,
      center = { x: radius, y: radius };
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.beginPath();
  context.fillStyle = '#aaa';
  context.arc(center.x, center.y, 0.015 * radius, 0, 2 * Math.PI);
  context.fill();

  var gap = 0.01 * radius,
      hourRadius = 0.210 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.165 * radius,
      minuteDistance = hourDistance - gap - hourRadius - minuteRadius,
      secondRadius = 0.100 * radius,
      secondDistance = minuteDistance - gap - minuteRadius - secondRadius;

  var paint = function (value, textMaker, hertz, distance, radius,
        color, discColor) {
    var angle = -Math.PI / 2 + value * 2 * Math.PI / hertz,
        text = textMaker(value),
        x = center.x + Math.cos(angle) * distance,
        y = center.y + Math.sin(angle) * distance,
        fontSize = 1.33 * radius,
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
      paint(h, Clock.textMaker.hour, 12,
          hourDistance, hourRadius, '#fff', '#444');
    } else {
      paint(h, Clock.textMaker.hour, 12, hourDistance, hourRadius, '#444');
    }
  }
  paint(minute, Clock.textMaker.minute, 60,
      minuteDistance, minuteRadius, '#fff', '#666');
  paint(second, Clock.textMaker.second, 60,
      secondDistance, secondRadius, '#fff', '#888');
};

// Sector clock.
Clock.sectorClockBasic = {};

Clock.sectorClockBasic.update = function (hour, minute, second, millisecond) {
  var context = Clock.sectorClockBasic.context,
      radius = Clock.radius,
      center = { x: radius, y: radius },
      thickness = 5;
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.lineWidth = 0.04 * radius;

  var hourRadius = 0.20 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.16 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius,
      secondRadius = 0.12 * radius,
      secondDistance = minuteDistance - minuteRadius - secondRadius;

  var paintArc = function (value, valueText, hertz, handDistance, handRadius,
        circleColor, arcColor) {
    var angle = -Math.PI / 2 + value * 2 * Math.PI / hertz;
    // Background circle.
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
    // Value text.
    var x = center.x + Math.cos(angle) * (handDistance - thickness / 2),
        y = center.y + Math.sin(angle) * (handDistance - thickness / 2),
        fontSize = Math.round(1.2 * handRadius),
        font = fontSize + 'px sans-serif';
    context.font = font;
    var m = Clock.measure.text(valueText, font, fontSize);
    context.fillStyle = '#222';
    context.fillText(valueText,
        x - m.fillCenter.x,
        y - m.fillCenter.y);
  };
  paintArc(hour, Clock.textMaker.hour(hour), 12,
      hourDistance, hourRadius, '#f4f4f4', '#444');
  paintArc(minute, Clock.textMaker.minute(minute), 60,
      minuteDistance, minuteRadius, '#f4f4f4', '#444');
  paintArc(second, Clock.textMaker.second(second), 60,
      secondDistance, secondRadius, '#f4f4f4', '#444');
};

// Sector clock with centered seconds, equal-size values, sector animation.
Clock.sectorClockImproved = {};

Clock.sectorClockImproved.update = function (hour, minute, second,
    millisecond) {
  var context = Clock.sectorClockImproved.context,
      radius = Clock.radius,
      center = { x: radius, y: radius },
      thickness = 6;
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.lineWidth = 0.04 * radius;

  var hourRadius = 0.20 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.19 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius,
      secondRadius = 0.09 * radius,
      secondDistance = minuteDistance - minuteRadius - secondRadius;

  var paintArc = function (value, valueText, hertz, handDistance, handRadius,
        circleColor, arcColor, centered) {
    var angle = -Math.PI / 2 + value * 2 * Math.PI / hertz;
    // Background circle.
    context.beginPath();
    context.strokeStyle = circleColor;
    var distance = handDistance + handRadius - thickness / 2;
        //(centered ? 0.2 : -1) * thickness / 2;
    context.arc(center.x, center.y, distance, 0, 2 * Math.PI);
    context.stroke();
    // Foreground arc.
    context.beginPath();
    context.strokeStyle = arcColor;
    context.arc(center.x, center.y, distance,
        angle - Math.PI / hertz, angle + Math.PI / hertz);
    context.stroke();
    // Value text.
    var x = center.x + Math.cos(angle) * (handDistance - thickness / 2),
        y = center.y + Math.sin(angle) * (handDistance - thickness / 2),
        fontSize = Math.round(1.3 * handRadius);
    if (centered) {
      x = center.x;
      y = center.y;
      fontSize *= 2;
    }
    var font = fontSize + 'px sans-serif';
    context.font = font;
    var m = Clock.measure.text(valueText, font, fontSize);
    context.fillStyle = '#222';
    context.fillText(valueText,
        x - m.fillCenter.x,
        y - m.fillCenter.y);
  };
  paintArc(hour, Clock.textMaker.hour(hour), 12,
      hourDistance, hourRadius, '#f4f4f4', '#444');
  paintArc(minute, Clock.textMaker.minute(minute), 60,
      minuteDistance, minuteRadius, '#f4f4f4', '#444');
  paintArc(second, Clock.textMaker.second(second), 60,
      secondDistance, secondRadius, '#f4f4f4', '#444', true);
};


Clock.update = function () {
  var date = new Date(),
      hour = date.getHours() % 12,
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds();

  Clock.bubbleClock.update(hour, minute, second, millisecond);
  Clock.mundaneClock.update(hour, minute, second, millisecond);
  Clock.sectorClockBasic.update(hour, minute, second, millisecond);
  Clock.sectorClockImproved.update(hour, minute, second, millisecond);

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

  var container = document.getElementById('watchContainer'),
      clocks = [ Clock.mundaneClock, Clock.bubbleClock,
                 Clock.sectorClockBasic, Clock.sectorClockImproved ];
  clocks.forEach(function (clock) {
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
