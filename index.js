const SCROLL_STOPPED_TIMEOUT = 90;

export default function detectScrollSwipeDirection(
  elementToScrollSwipe = document
) {
  let scrollLocked = false;
  let isScrolling = false;
  let isScrollingTimer = null;
  let firstTouchX = null;
  let firstTouchY = null;

  return (callback) => {
    elementToScrollSwipe.addEventListener("wheel", (e) => {
      const delta = e.wheelDelta || -e.detail;
      if (scrollLocked) return;
      if (isScrolling) return;
      if (delta > -3 && delta < 3) return;

      const direction = getDirection(e);
      reportDirection(direction);
    });

    elementToScrollSwipe.addEventListener("touchstart", (e) => {
      if (scrollLocked) return;
      if (isScrolling) return;

      const { clientX, clientY } = e.touches[0];
      firstTouchX = clientX;
      firstTouchY = clientY;
    });

    elementToScrollSwipe.addEventListener("touchmove", (e) => {
      if (scrollLocked) return;
      if (isScrolling) return;
      if (!firstTouchX || !firstTouchY) return;

      const { clientX, clientY } = e.touches[0];
      const deltaX = firstTouchX - clientX;
      const deltaY = firstTouchY - clientY;

      const direction = getDirection({ deltaX, deltaY });
      reportDirection(direction);

      firstTouchX = null;
      firstTouchY = null;
    });

    function reportDirection(direction) {
      const promise = callback(direction);

      if (promise.then) {
        scrollLocked = true;
        promise.then(() => {
          scrollLocked = false;
        });
      } else {
        scrollLocked = false;
      }

      isScrolling = true;
      if (isScrollingTimer) clearTimeout(isScrollingTimer);
      isScrollingTimer = setTimeout(() => {
        isScrolling = false;
      }, SCROLL_STOPPED_TIMEOUT);
    }
  };
}

function getDirection({ deltaX, deltaY }) {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) return "left";
    return "right";
  }

  if (deltaY < 0) return "up";
  return "down";
}
