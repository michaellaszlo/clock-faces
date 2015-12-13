Clock = {
  initial: {
    diameter: 300
  },
  font: "'Roboto Condensed', sans-serif",
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

// Mundane clock.
Clock.mundaneClock = {
  color: {
    digit: '#444',
    tick: { hour: '#222', minute: '#666' },
    hand: { hour: '#222', minute: '#222', second: '#222' }
  }
};
Clock.mundaneClock.update = function (hour, minute, second, millisecond) {
  var thisClock = Clock.mundaneClock,
      color = thisClock.color,
      context = thisClock.context,
      radius = Clock.radius,
      center = { x: radius, y: radius };
  context.clearRect(0, 0, 2 * radius, 2 * radius);

  var tickRadius = 0.033 * radius,
      tickDistance = radius - tickRadius,
      hourRadius = 0.21 * radius,
      hourDistance = tickDistance - tickRadius - hourRadius,
      fontSize = Math.round(1.33 * hourRadius);

  for (var i = 0; i < 60; ++i) {
    var angle = -Math.PI / 2 + i * Math.PI / 30;
    if (i % 5 == 0) {
      var x = center.x + Math.cos(angle) * hourDistance,
          y = center.y + Math.sin(angle) * hourDistance,
          text = '' + (i == 0 ? 12 : i / 5),
          font = fontSize + 'px ' + Clock.font;
      context.font = font;
      var m = MeasureText.measure(fontSize, Clock.font, text),
          all = MeasureText.measureAll(fontSize, Clock.font),
          xdFill = -m.formal.width / 2,
          ydFill = -all.pixel.centerFromFill.y;
      context.fillStyle = color.digit;
      context.fillText(text, x + xdFill, y + ydFill);

      context.lineWidth = 4;
      context.strokeStyle = color.tick.hour;
    } else {
      context.lineWidth = 1;
      context.strokeStyle = color.tick.minute;
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
      hourHandLength = 0.28 * radius,
      hourHandThickness = 0.035 * radius,
      minuteHandLength = 0.56 * radius,
      minuteHandThickness = 0.020 * radius,
      secondHandLength = 0.85 * radius,
      secondHandThickness = 0.005 * radius;
  function paintHand(angle, length, thickness, strokeColor) {
    context.beginPath();
    context.lineWidth = thickness;
    context.strokeStyle = strokeColor;
    context.moveTo(center.x + Math.cos(angle + Math.PI) * 0.06 * length,
                   center.y + Math.sin(angle + Math.PI) * 0.06 * length);
    context.lineTo(center.x + Math.cos(angle) * length,
                   center.y + Math.sin(angle) * length);
    context.stroke();
  }
  paintHand(hourAngle, hourHandLength, hourHandThickness,
      color.hand.hour);
  paintHand(minuteAngle, minuteHandLength, minuteHandThickness,
      color.hand.minute);
  paintHand(secondAngle, secondHandLength, secondHandThickness,
      color.hand.second);
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

  function paint(value, textMaker, hertz, distance, radius,
        color, discColor) {
    var angle = -Math.PI / 2 + value * 2 * Math.PI / hertz,
        text = textMaker(value),
        x = center.x + Math.cos(angle) * distance,
        y = center.y + Math.sin(angle) * distance,
        fontSize = Math.round(1.33 * radius),
        font = fontSize + 'px ' + Clock.font;
    context.font = font;
    var m = MeasureText.measure(fontSize, Clock.font, text),
        all = MeasureText.measureAll(fontSize, Clock.font),
        xdFill = -m.formal.width / 2,
        ydFill = -all.pixel.centerFromFill.y;
    if (discColor) {
      context.fillStyle = discColor;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
    }
    context.fillStyle = color;
    context.fillText(text, x + xdFill, y + ydFill);
  }
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
      thickness = 0.05 * radius;
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.lineWidth = thickness;

  var hourRadius = 0.20 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.16 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius,
      secondRadius = 0.12 * radius,
      secondDistance = minuteDistance - minuteRadius - secondRadius;

  function paintArc(value, valueText, hertz, handDistance, handRadius,
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
        font = fontSize + 'px ' + Clock.font;
    context.font = font;
    var m = MeasureText.measure(fontSize, Clock.font, valueText),
        all = MeasureText.measureAll(fontSize, Clock.font),
        xdFill = -m.formal.width / 2,
        ydFill = -all.pixel.centerFromFill.y;
    context.fillStyle = '#222';
    context.fillText(valueText, x + xdFill, y + ydFill);
  };
  paintArc(hour, Clock.textMaker.hour(hour), 12,
      hourDistance, hourRadius, '#f4f4f4', '#444');
  paintArc(minute, Clock.textMaker.minute(minute), 60,
      minuteDistance, minuteRadius, '#f4f4f4', '#444');
  paintArc(second, Clock.textMaker.second(second), 60,
      secondDistance, secondRadius, '#f4f4f4', '#444');
};

// Sector clock with centered seconds, tick marks, animated sectors.
Clock.sectorClockImproved = {};
Clock.sectorClockImproved.paintArc = function (value, fraction, valueText,
        hertz, handDistance, handRadius, thickness, context, color, options) {
  options = options || {};
  var radius = Clock.radius,
      center = { x: radius, y: radius },
      angle = -Math.PI / 2 + value * 2 * Math.PI / hertz,
      distance = handDistance + handRadius - thickness / 2;
  // Background circle with zebra stripes or tick marks.
  if (options.zebra) {
    for (var i = 0; i < hertz; ++i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / hertz;
      context.beginPath();
      context.strokeStyle = (i % 2 == 0 ? color.circle : color.stripe);
      context.arc(center.x, center.y, distance, a, a + 4 * Math.PI / hertz);
      context.stroke();
    }
    context.beginPath();
    context.strokeStyle = color.circle;
    context.arc(center.x, center.y, distance,
        -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI / hertz);
    context.stroke();
  } else {
    context.beginPath();
    context.lineWidth = thickness;
    context.strokeStyle = color.circle;
    context.arc(center.x, center.y, distance, 0, 2 * Math.PI);
    context.stroke();
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = color.tick;
    for (var i = 0; i < hertz; ++i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / hertz;
      context.moveTo(center.x + Math.cos(a) * (distance - thickness / 2),
                     center.y + Math.sin(a) * (distance - thickness / 2));
      context.lineTo(center.x + Math.cos(a) * (distance + thickness / 2),
                     center.y + Math.sin(a) * (distance + thickness / 2));
    }
    context.stroke();
  }
  // Current arc.
  context.lineWidth = thickness;
  if (options.sweep) {
    context.beginPath();
    context.strokeStyle = color.arc.done;
    var a = angle + fraction * 2 * Math.PI / hertz;
    context.arc(center.x, center.y, distance, a, a + 2 * Math.PI / hertz);
    context.stroke();
  } else {
    context.beginPath();
    context.strokeStyle = color.arc.remaining;
    context.arc(center.x, center.y, distance,
        angle, angle + 2 * Math.PI / hertz);
    context.stroke();
    context.beginPath();
    context.strokeStyle = color.arc.done;
    context.arc(center.x, center.y, distance,
        angle, angle + fraction * 2 * Math.PI / hertz);
    context.stroke();
  }
  // Value text.
  if (options.textCenteredInArc) {
    angle += Math.PI / hertz;
  }
  var x = center.x + Math.cos(angle) * (handDistance - thickness / 2),
      y = center.y + Math.sin(angle) * (handDistance - thickness / 2),
      fontSize = Math.round(1.3 * handRadius);
  if (options.centerOfCircle) {
    x = center.x;
    y = center.y;
    fontSize *= 2;
  }
  var font = fontSize + 'px ' + Clock.font;
  context.font = font;
  var m = MeasureText.measure(fontSize, Clock.font, valueText),
      all = MeasureText.measureAll(fontSize, Clock.font),
      xdFill = -m.formal.width / 2,
      ydFill = -all.pixel.centerFromFill.y;
  context.fillStyle = '#222';
  if (options.rotateText) {
    context.save();
    context.translate(x, y);
    if (angle > Math.PI || angle <= 0) {
      context.rotate(angle + Math.PI / 2);
    } else {
      context.rotate(angle + 3 * Math.PI / 2);
    }
    context.translate(xdFill, ydFill);
    context.fillText(valueText, 0, 0);
    context.restore();
  }
  else {
    context.fillText(valueText, x + xdFill, y + ydFill);
  }
};

Clock.sectorClockImproved.update = function (hour, minute, second,
    millisecond) {
  var context = Clock.sectorClockImproved.context,
      radius = Clock.radius,
      thickness = 0.05 * radius,
      hourRadius = 0.22 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.18 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius,
      secondRadius = 0.07 * radius,
      secondDistance = minuteDistance - minuteRadius - secondRadius,
      secondFraction = millisecond / 1000,
      minuteFraction = (second + secondFraction) / 60,
      hourFraction = (minute + minuteFraction) / 60,
      color = { circle: '#f4f4f4', tick: '#666', stripe: '#e8e8e8',
        arc: { done: '#222', remaining: '#888' } };
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.lineWidth = thickness;
  var paintArc = Clock.sectorClockImproved.paintArc;
  paintArc(hour, hourFraction,
      Clock.textMaker.hour(hour), 12,
      hourDistance, hourRadius, thickness, context, color);
  paintArc(minute, minuteFraction,
      Clock.textMaker.minute(minute), 60,
      minuteDistance, minuteRadius, thickness, context, color);
  color.tick = color.circle = '#eee';
  paintArc(second, secondFraction,
      Clock.textMaker.second(second), 60,
      secondDistance, secondRadius, thickness, context, color,
      { centerOfCircle: true, sweep: false });
};

// Sector clock with centered seconds, tick marks, animated sectors.
Clock.sectorClockImprovedInverted = {};
Clock.sectorClockImprovedInverted.update = function (hour, minute, second,
    millisecond) {
  var context = Clock.sectorClockImprovedInverted.context,
      radius = Clock.radius,
      thickness = 0.05 * radius,
      secondRadius = 0.14 * radius,
      secondDistance = radius - secondRadius,
      minuteRadius = 0.21 * radius,
      minuteDistance = secondDistance - secondRadius - minuteRadius,
      hourRadius = 0.15 * radius,
      hourDistance = minuteDistance - minuteRadius - hourRadius,
      secondFraction = millisecond / 1000,
      minuteFraction = (second + secondFraction) / 60,
      hourFraction = (minute + minuteFraction) / 60,
      color = { circle: '#f4f4f4', tick: '#666', stripe: '#e8e8e8',
        arc: { done: '#222', remaining: '#888' } };
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.lineWidth = thickness;
  var paintArc = Clock.sectorClockImproved.paintArc;
  paintArc(second, secondFraction,
      Clock.textMaker.second(second), 60,
      secondDistance, secondRadius, thickness, context, color,
      { zebra: true, textCenteredInArc: false, rotateText: false });
  paintArc(minute, minuteFraction,
      Clock.textMaker.minute(minute), 60,
      minuteDistance, minuteRadius, thickness, context, color,
      { zebra: true, rotateText: false });
  paintArc(hour, hourFraction,
      Clock.textMaker.hour(hour), 12,
      hourDistance, hourRadius, thickness, context, color,
      { zebra: true, centerOfCircle: true });
};


Clock.update = function () {
  var date = new Date(),
      hour = date.getHours() % 12,
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds();

  Clock.clocks.forEach(function (clock) {
    clock.update(hour, minute, second, millisecond);
  });

  if (Clock.stopped) {
    return;
  }
  window.requestAnimationFrame(Clock.update);
};

Clock.load = function () {
  MeasureText.setCanvas(document.createElement('canvas'),
      document.createElement('canvas'));

  var diameter = Clock.diameter = Clock.initial.diameter;
  Clock.radius = diameter / 2;

  var container = document.getElementById('watchContainer'),
      clocks = Clock.clocks = [
          Clock.mundaneClock, Clock.bubbleClock,
          Clock.sectorClockBasic, Clock.sectorClockImproved,
          Clock.sectorClockImprovedInverted
      ];
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
