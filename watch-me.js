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

WatchMe.update = function () {
  var date = new Date(),
      hour = date.getHours(),
      minutes = date.getMinutes(),
      seconds = date.getSeconds(),
      milliseconds = date.getMilliseconds();

  // Textual time check.
  WatchMe.display.timeCheck.innerHTML = [ hour % 12,
      WatchMe.padLeft(minutes, '0', 2),
      WatchMe.padLeft(seconds, '0', 2) ].join(':');

  // Draw background graphics.
  var context = WatchMe.context.watch,
      radius = WatchMe.radius,
      center = { x: radius, y: radius };
      thickness = 1;
  context.lineWidth = thickness;
  context.fillStyle = '#eee';
  context.strokeStyle = '#ddd';
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.beginPath();
  context.arc(center.x, center.y, radius - thickness / 2, 0, 2 * Math.PI);
  context.fill();

  // Hours.
  var hourRadius = 0.24 * radius,
      hourDistance = radius - hourRadius;
  context.strokeStyle = '#666';
  for (var i = 0; i < 12; ++i) {
    var angle = i * Math.PI / 6,
        x = Math.cos(angle) * hourDistance + center.x,
        y = Math.sin(angle) * hourDistance + center.y;
    context.beginPath();
    context.arc(x, y, hourRadius, 0, 2 * Math.PI);
    context.stroke();
  }

  // Minutes.
  var minuteRadius = 0.16 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius;
  context.strokeStyle = '#888';
  for (var i = 0; i < 60; ++i) {
    var angle = i * Math.PI / 30,
        x = Math.cos(angle) * minuteDistance + center.x,
        y = Math.sin(angle) * minuteDistance + center.y;
    context.beginPath();
    context.arc(x, y, minuteRadius, 0, 2 * Math.PI);
    context.stroke();
  }

  window.requestAnimationFrame(WatchMe.update);
};

WatchMe.load = function () {
  WatchMe.display = {
    timeCheck: document.getElementById('timeCheck')
  };
  WatchMe.canvas = {
    watch: document.createElement('canvas')
  };
  var canvas = WatchMe.canvas.watch,
      diameter = WatchMe.diameter = WatchMe.initial.diameter,
      radius = WatchMe.radius = diameter / 2;
  document.getElementById('watchContainer').appendChild(canvas);
  canvas.width = diameter;
  canvas.height = diameter;
  WatchMe.context = {
    watch: canvas.getContext('2d')
  };
  window.requestAnimationFrame(WatchMe.update);
};

window.onload = WatchMe.load;
