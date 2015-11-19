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
      hour = date.getHours() % 12,
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds();

  // Textual time check.
  WatchMe.display.timeCheck.innerHTML = [ hour,
      WatchMe.padLeft(minute, '0', 2),
      WatchMe.padLeft(second, '0', 2) ].join(':');

  // Draw background graphics.
  var context = WatchMe.context.watch,
      radius = WatchMe.radius,
      center = { x: radius, y: radius };
      thickness = 1;
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.lineWidth = thickness;

  var hourRadius = 0.21 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.16 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius,
      secondRadius = 0.10 * radius,
      secondDistance = minuteDistance - minuteRadius - secondRadius;
  context.fillStyle = '#eee';
  context.strokeStyle = '#ddd';
  context.beginPath();
  context.arc(center.x, center.y, radius - thickness / 2, 0, 2 * Math.PI);
  context.fill();
  context.fillStyle = '#ddd';
  context.strokeStyle = '#ccc';
  context.beginPath();
  context.arc(center.x, center.y, hourDistance - hourRadius - thickness / 2,
      0, 2 * Math.PI);
  context.fill();
  context.fillStyle = '#ccc';
  context.strokeStyle = '#bbb';
  context.beginPath();
  context.arc(center.x, center.y, minuteDistance - minuteRadius - thickness / 2,
      0, 2 * Math.PI);
  context.fill();

  context.strokeStyle = '#666';
  var angle = -Math.PI / 2 + hour * Math.PI / 6,
      x = Math.cos(angle) * hourDistance + center.x,
      y = Math.sin(angle) * hourDistance + center.y;
  context.fillStyle = '#888';
  context.beginPath();
  context.arc(x, y, hourRadius, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = '#666';
  var angle = -Math.PI / 2 + minute * Math.PI / 30,
      x = Math.cos(angle) * minuteDistance + center.x,
      y = Math.sin(angle) * minuteDistance + center.y;
  context.beginPath();
  context.arc(x, y, minuteRadius, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = '#444';
  var angle = -Math.PI / 2 + second * Math.PI / 30,
      x = Math.cos(angle) * secondDistance + center.x,
      y = Math.sin(angle) * secondDistance + center.y;
  context.beginPath();
  context.arc(x, y, secondRadius, 0, 2 * Math.PI);
  context.fill();

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
