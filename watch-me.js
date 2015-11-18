WatchMe = {
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
  WatchMe.display.timeCheck.innerHTML = [ hour % 12,
      WatchMe.padLeft(minutes, '0', 2),
      WatchMe.padLeft(seconds, '0', 2) ].join(':');
  window.requestAnimationFrame(WatchMe.update);
};

WatchMe.load = function () {
  WatchMe.display = {
    timeCheck: document.getElementById('timeCheck')
  };
  window.requestAnimationFrame(WatchMe.update);
};

window.onload = WatchMe.load;
