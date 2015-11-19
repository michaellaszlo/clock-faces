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
      center = { x: radius, y: radius },
      thickness = 1;
  context.lineWidth = thickness;
  context.fillStyle = '#eee';
  context.strokeStyle = '#ddd';
  context.clearRect(0, 0, 2 * radius, 2 * radius);
  context.beginPath();
  context.arc(center.x, center.y, radius - thickness / 2, 0, 2 * Math.PI);
  context.fill();
  console.log(context.imageSmoothingEnabled);

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
