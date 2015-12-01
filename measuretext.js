var MeasureText = {};

MeasureText.cache = {};

MeasureText.measure = function (text, font, fontSize) {
  var cache = Clock.measure.cache;
  if (cache[font] !== undefined && cache[font].text[text] !== undefined) {
    return cache[font].text[text];
  }
  var canvas = Clock.measure.canvas,
      context = Clock.measure.context;
  if (context.font != font) {
    context.font = font;
  }
  var nominalWidth = Math.ceil(context.measureText(text).width);
  if (canvas.width < 2 * nominalWidth) {
    canvas.width = 2 * nominalWidth;
    context.font = font;
  }
  if (canvas.height < 2 * fontSize) {
    canvas.height = 2 * fontSize;
    context.font = font;
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  var canvasHeight = canvas.height,
      xFill = 20,
      yFill = canvasHeight / 2;
  context.fillText(text, xFill, yFill);
  var data = context.getImageData(xFill, 0, nominalWidth, canvasHeight).data,
      xMin, xMax, yMin, yMax;
  for (var x = xFill; x < xFill + nominalWidth; ++x) {
    for (var y = 0; y < canvasHeight; ++y) {
      var i = 4 * (y * nominalWidth + x);
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
  console.log(fontSize + 'px', text, nominalWidth, xMax - xMin + 1, xMin, xMax);
  context.fillStyle = '#eee';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ccc';
  context.fillRect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
  var x0 = xMin + (xMin + xMax) / 2,
      y0 = yMin + (yMin + yMax) / 2,
      radiusSquared = 0;
  for (var x = xMin; x <= xMax; ++x) {
    for (var y = yMin; y <= yMax; ++y) {
      var i = 4 * (y * nominalWidth + x);
      if (data[i + 3] == 0) {
        continue;
      }
      var dx = Math.abs(x - x0) + 1,
          dy = Math.abs(y - y0) + 1;
      radiusSquared = Math.max(radiusSquared, dx * dx + dy * dy);
    }
  }
  var radius = Math.ceil(Math.sqrt(radiusSquared));
  //context.fillRect(0, yMin, width, yMax - yMin + 1);
  context.fillStyle = '#000';
  context.fillText(text, xFill, yFill);
  if (cache[font] === undefined) {
    cache[font] = {
      text: {},
      yMin: yMin,
      yMax: yMax
    };
  } else {
    cache[font].yMin = Math.min(cache[font].yMin, yMin);
    cache[font].yMax = Math.max(cache[font].yMax, yMax);
  }
  var measurement = cache[font].text[text] = {
    xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax,
    nominalWidth: nominalWidth,
    measuredWidth: xMax - xMin,
    radius: radius,
    center: {  // Relative to fill point.
      x: x0 - xFill,
      y: y0 - yFill
    },
  };
  return measurement;
};

MeasureText.loadTest = function () {
  var input = document.getElementById('textInput'),
      container = document.getElementById('canvasContainer'),
      canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
  container.appendChild(canvas);
  var fontSize = 24,
      fontString = fontSize + "px 'Roboto Condensed', sans-serif";
  canvas.width = canvas.height = 0;

  input.oninput = function () {
    var text = input.value;
    console.log(text);
    var minWidth = context.measureText(text).width,
        minHeight = 2 * fontSize,
        canvasModified = false;
    if (canvas.width < minWidth) {
      canvas.width = minWidth;
      canvasModified = true;
    }
    if (canvas.height < minHeight) {
      canvas.height = minHeight;
      canvasModified = true;
    }
    if (canvasModified) {
      context.font = fontString;
    }
    var width = canvas.width,
        height = canvas.height,
        xFill = 0,
        yFill = height / 2;
    context.clearRect(0, 0, width, height);
    context.fillText(text, xFill, yFill);
  };
};
