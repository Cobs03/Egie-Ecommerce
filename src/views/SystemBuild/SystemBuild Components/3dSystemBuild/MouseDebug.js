export const attachMouseDebugListeners = (canvas) => {
  const handleMouseDown = (e) => {
  };

  const handleWheel = (e) => {
  };

  const handleMouseEnter = () => {
  };

  const handleMouseLeave = () => {
  };

  const handleMouseMove = (e) => {
    // Too spammy, only log occasionally
  };

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('wheel', handleWheel);
  canvas.addEventListener('mouseenter', handleMouseEnter);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('mousemove', handleMouseMove);

  return {
    handleMouseDown,
    handleWheel,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove
  };
};

export const detachMouseDebugListeners = (canvas, handlers) => {
  if (canvas && handlers) {
    canvas.removeEventListener('mousedown', handlers.handleMouseDown);
    canvas.removeEventListener('wheel', handlers.handleWheel);
    canvas.removeEventListener('mouseenter', handlers.handleMouseEnter);
    canvas.removeEventListener('mouseleave', handlers.handleMouseLeave);
    canvas.removeEventListener('mousemove', handlers.handleMouseMove);
  }
};