var MeasureText = {};

MeasureText.cache = {};

MeasureText.measure = function (fontSize, fontFamily, text) {
  // Check for a prior measurement of the same text in the same font.
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
  var ostensibleWidth = Math.ceil(context.measureText(text).width),
      minWidth = ostensibleWidth,
      minHeight = 2 * fontSize,
      canvasModified = false;
  console.log('ostensibleWidth:', ostensibleWidth);
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

  // Define the measurement bounds.
  var xBegin = 0,
      xLimit = minWidth,
      xSpan = xLimit - xBegin,
      yBegin = 0,
      yLimit = minHeight,
      ySpan = yLimit - yBegin;
  if (xSpan * ySpan == 0) {
    return;
  }
  console.log(xBegin, yBegin, xSpan, ySpan);
  debugContext.fillStyle = '#ddd';
  debugContext.fillRect(xBegin, yBegin, xSpan, ySpan);

  // Look for non-zero pixels.
  var data = context.getImageData(xBegin, yBegin, xSpan, ySpan).data,
      xMin, yMin, xMin, xMax;
  for (var dy = 0; dy < ySpan; ++dy) {
    // Alpha value of the pixel preceding the first pixel in this row.
    var pos = 4 * (dy * ySpan - 1) + 3;
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
        yMax = dy;  // dy increases monotonically
      }
    }
  }
  // Convert data coordinates to canvas coordinates.
  xMin += xBegin;
  xMax += xBegin;
  yMin += yBegin;
  yMax += yBegin;

  console.log('xMin:', xMin, ', yMin:', yMin, ', xMax:', xMax, ', yMax:', yMax);

  // Make the return value and store it in the cache.
  var measurement = {};
  if (cache[font] === undefined) {
    cache[font] = {
      text: {}
    };
  }
  cache[font].text[text] = measurement;
  return measurement;
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

  var fontSize = 24,
      fontFamily = "'Roboto Condensed', sans-serif";

  input.oninput = function () {
    MeasureText.measure(fontSize, fontFamily, input.value);
  };
};
