export const attachMouseDebugListeners = (canvas) => {
  console.log('🖱️ Attaching mouse debug listeners...');

  const handleMouseDown = (e) => {
    console.log('🖱️ mousedown:', {
      target: e.target.tagName,
      button: e.button,
      clientX: e.clientX,
      clientY: e.clientY
    });
  };

  const handleWheel = (e) => {
    console.log('🖱️ wheel:', e.deltaY);
  };

  const handleMouseEnter = () => {
    console.log('✅ Mouse ENTERED canvas');
  };

  const handleMouseLeave = () => {
    console.log('⚠️ Mouse LEFT canvas');
  };

  const handleMouseMove = (e) => {
    // Too spammy, only log occasionally
    // console.log('🖱️ Mouse moving:', e.clientX, e.clientY);
  };

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('wheel', handleWheel);
  canvas.addEventListener('mouseenter', handleMouseEnter);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('mousemove', handleMouseMove);

  console.log('✅ Mouse debug listeners attached');
  console.log('🔍 Canvas info:', {
    width: canvas.width,
    height: canvas.height,
    boundingRect: canvas.getBoundingClientRect(),
    style: {
      position: canvas.style.position,
      zIndex: canvas.style.zIndex,
      pointerEvents: canvas.style.pointerEvents,
      cursor: canvas.style.cursor
    }
  });

  return {
    handleMouseDown,
    handleWheel,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove
  };
};

export const detachMouseDebugListeners = (canvas, handlers) => {
  console.log('🖱️ Detaching mouse debug listeners...');
  
  if (canvas && handlers) {
    canvas.removeEventListener('mousedown', handlers.handleMouseDown);
    canvas.removeEventListener('wheel', handlers.handleWheel);
    canvas.removeEventListener('mouseenter', handlers.handleMouseEnter);
    canvas.removeEventListener('mouseleave', handlers.handleMouseLeave);
    canvas.removeEventListener('mousemove', handlers.handleMouseMove);
    console.log('✅ Mouse debug listeners detached');
  }
};