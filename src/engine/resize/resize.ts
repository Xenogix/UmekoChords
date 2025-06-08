export function resize(width: number, height: number, pixelWidth: number, pixelHeight: number) {
  // Maintain aspect ratio and pixel scale
  const scaleX = width / pixelWidth;
  const scaleY = height / pixelHeight;
  const scale = Math.min(scaleX, scaleY);
  const x = (width - pixelWidth * scale) / 2;
  const y = (height - pixelHeight * scale) / 2;

  return { width, height, x, y, scale };
}
