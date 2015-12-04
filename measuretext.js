var MeasureText = {};

MeasureText.cache = {};

MeasureText.measure = function (fontSize, fontFamily, text) {
  // Check for a prior result of the same text in the same font.
  var cache = MeasureText.cache,
      font = fontSize + 'px ' + fontFamily;
  if (cache[font] !== undefined && cache[font].text[text] !== undefined) {
    return cache[font].text[text];
  }

  var canvas = MeasureText.canvas,
      context = MeasureText.context,
      debugCanvas = MeasureText.debugCanvas,
      debugContext = MeasureText.debugContext;

  // Ensure that context.measureText will work.
  if (context.font != font) {
    context.font = font;
  }

  // Make sure the canvas is large enough for the text.
  var formalWidth = Math.ceil(context.measureText(text).width),
      minWidth = formalWidth,
      minHeight = 2 * fontSize,
      canvasModified = false;
  if (canvas.width < minWidth) {
    canvas.width = debugCanvas.width = minWidth;
    canvasModified = true;
  }
  if (canvas.height < minHeight) {
    canvas.height = debugCanvas.height = minHeight;
    canvasModified = true;
  }
  // When the font reverts to default, set it anew.
  if (canvasModified) {
    context.font = font;
  }

  // Render the specified text.
  var xFill = 0,
      yFill = minHeight / 2;
  context.clearRect(0, 0, canvas.width, canvas.height);
  debugContext.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, xFill, yFill);

  // Define the result bounds.
  var xBegin = 0,
      xLimit = minWidth,
      xSpan = xLimit - xBegin,
      yBegin = 0,
      yLimit = minHeight,
      ySpan = yLimit - yBegin;
  if (xSpan * ySpan == 0) {
    return;
  }
  debugContext.fillStyle = '#ddd';

  // Look for non-zero pixels.
  var data = context.getImageData(xBegin, yBegin, xSpan, ySpan).data,
      xMin, yMin, xMax, yMax;
  for (var dy = 0; dy < ySpan; ++dy) {
    // Alpha value of the pixel preceding the first pixel in this row.
    var pos = 4 * (dy * xSpan - 1) + 3;
    for (var dx = 0; dx < xSpan; ++dx) {
      pos += 4;
      if (data[pos] == 0) {
        continue;
      }
      if (xMin === undefined) {
        xMin = xMax = dx;
        yMin = yMax = dy;
      } else {
        xMin = Math.min(xMin, dx);
        xMax = Math.max(xMax, dx);
        yMax = dy;  // dy increases monotonically
      }
    }
  }
  // Convert data coordinates to canvas coordinates.
  xMin += xBegin;
  xMax += xBegin;
  yMin += yBegin;
  yMax += yBegin;

  // Work out rectangle dimensions and center relative to fill point.
  var result = {
    formal: {
      width: formalWidth
    },
    pixel: {
      width: xMax - xMin + 1,
      height: yMax - yMin + 1,
      centerFromFill: {
        x: (xMin + xMax) / 2 - xFill,
        y: (yMin + yMax) / 2 - yFill
      }
    }
  };

  debugContext.fillStyle = '#ba5956';
  debugContext.fillRect(xFill, yMin, formalWidth, result.pixel.height);
  debugContext.fillStyle = '#a7ba82';
  debugContext.fillRect(xMin, yMin, result.pixel.width, result.pixel.height);
  debugContext.beginPath();
  var x0 = xFill + result.pixel.centerFromFill.x,
      y0 = yFill + result.pixel.centerFromFill.y;
  debugContext.strokeStyle = '#3f66ba';
  debugContext.moveTo(x0, y0 - result.pixel.height / 2);
  debugContext.lineTo(x0, y0 + result.pixel.height / 2);
  debugContext.moveTo(x0 - result.pixel.width / 2, y0);
  debugContext.lineTo(x0 + result.pixel.width / 2, y0);
  debugContext.stroke();
  console.log(JSON.stringify(result));

  // Make the return value and store it in the cache.
  if (cache[font] === undefined) {
    cache[font] = {
      text: {}
    };
  }
  cache[font].text[text] = result;
  return result;
};

MeasureText.setCanvas = function (canvas, debugCanvas) {
  MeasureText.canvas = canvas;
  MeasureText.context = canvas.getContext('2d');
  canvas.width = canvas.height = 0;
  MeasureText.debugCanvas = debugCanvas;
  MeasureText.debugContext = debugCanvas.getContext('2d');
  debugCanvas.width = debugCanvas.height = 0;
};

MeasureText.loadTest = function () {
  var input = document.getElementById('textInput'),
      container = document.getElementById('canvasContainer'),
      debugCanvas = document.createElement('canvas');
      canvas = document.createElement('canvas');
  container.appendChild(debugCanvas);
  container.appendChild(canvas);
  canvas.id = 'measureCanvas';
  debugCanvas.id = 'debugCanvas';
  MeasureText.setCanvas(canvas, debugCanvas);

  var fontSize = 48,
      fontFamily = "'Roboto Condensed', sans-serif";

  input.oninput = function () {
    MeasureText.measure(fontSize, fontFamily, input.value);
  };
};
