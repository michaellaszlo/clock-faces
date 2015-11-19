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

  var hourRadius = 0.20 * radius,
      hourDistance = radius - hourRadius,
      minuteRadius = 0.16 * radius,
      minuteDistance = hourDistance - hourRadius - minuteRadius,
      secondRadius = 0.12 * radius,
      secondDistance = minuteDistance - minuteRadius - secondRadius;
  context.fillStyle = '#efefef';
  context.strokeStyle = '#ddd';
  context.beginPath();
  context.arc(center.x, center.y, radius - thickness / 2, 0, 2 * Math.PI);
  context.fill();
  context.fillStyle = '#e8e8e8';
  context.strokeStyle = '#ccc';
  context.beginPath();
  context.arc(center.x, center.y, hourDistance - hourRadius - thickness / 2,
      0, 2 * Math.PI);
  context.fill();
  context.fillStyle = '#e0e0e0';
  context.strokeStyle = '#bbb';
  context.beginPath();
  context.arc(center.x, center.y, minuteDistance - minuteRadius - thickness / 2,
      0, 2 * Math.PI);
  context.fill();

  var angle = -Math.PI / 2 + hour * Math.PI / 6;
  context.strokeStyle = '#888';
  thickness = 0.14 * hourRadius;
  context.lineWidth = thickness;
  context.beginPath();
  context.arc(center.x, center.y, hourDistance + hourRadius - thickness / 2,
      angle - Math.PI / 12, angle + Math.PI / 12);
  context.stroke();

  var angle = -Math.PI / 2 + minute * Math.PI / 30;
  context.strokeStyle = '#666';
  thickness = 0.18 * minuteRadius;
  context.lineWidth = thickness;
  context.beginPath();
  context.arc(center.x, center.y, minuteDistance + minuteRadius - thickness / 2,
      angle - Math.PI / 60, angle + Math.PI / 60);
  context.stroke();

  var angle = -Math.PI / 2 + second * Math.PI / 30;
  context.strokeStyle = '#444';
  thickness = 0.22 * secondRadius;
  context.lineWidth = thickness;
  context.beginPath();
  context.arc(center.x, center.y, secondDistance + secondRadius - thickness / 2,
      angle - Math.PI / 60, angle + Math.PI / 60);
  context.stroke();

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
