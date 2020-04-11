const isTouchSupported = window.DocumentTouch && document instanceof DocumentTouch;
const SCROLL_STOPPED_TIMEOUT = isTouchSupported ? 500 : 50;

export default function detectScrollSwipeDirection(
  elementToScrollSwipe = document
) {
  let scrollLocked = false;
  let isScrolling = false;
  let isScrollingTimer = null;
  let firstTouchX = null;
  let firstTouchY = null;
  let scrolling = null;

  return (callback) => {
    elementToScrollSwipe.addEventListener("wheel", (e) => {
      // const delta = e.wheelDelta || -e.detail;
      // if (delta > -3 && delta < 3) return;

      if (scrolling && !scrolling.isCompleted()) {
        scrolling.restart();
        return;
      }

      scrolling = new Scrolling(elementToScrollSwipe, e.target, () => {
        return callback(getDirection(e), e);
      });
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

      if (scrolling && !scrolling.isCompleted()) {
        scrolling.restart();
        return;
      }

      scrolling = new Scrolling(elementToScrollSwipe, e.target, () => {
        return callback(getDirection({ deltaX, deltaY }), e);
      });

      firstTouchX = null;
      firstTouchY = null;
    });
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

class Scrolling {
  constructor(expectedParent, element, onComplete) {
    this.parent = parent;
    this.onComplete = onComplete;
    this.onePromise = null;
    this.expectedParent = expectedParent;
    this.scrollParent = this.getScrollParent(element);
    this.hitTopCount = this.hasHitTop() ? 1 : 0;
    this.hitBottomCount = this.hasHitBottom() ? 1 : 0;
    this.start();
  }

  hasHitTop() {
    return this.scrollParent.scrollTop <= 0;
  }

  hasHitBottom() {
    return (this.scrollParent.clientHeight + this.scrollParent.scrollTop) >= this.scrollParent.scrollHeight;
  }

  getScrollParent(node) {
    if (node == null) {
      return null;
    }
  
    if (node.scrollHeight > node.clientHeight) {
      return node;
    } else {
      return this.getScrollParent(node.parentNode);
    }
  }

  start() {
    this.scrollCompleted = false;
    const { scrollParent, expectedParent } = this;

    if (scrollParent === expectedParent) {
      this.timer = setTimeout(() => {
        this.scrollCompleted = true;
      }, SCROLL_STOPPED_TIMEOUT)
      this.complete()
    } else {
      this.timer = setTimeout(() => {
        if (this.hasHitTop()) this.hitTopCount++;
        if (this.hasHitBottom()) this.hitBottomCount++;

        if (this.hitBottomCount === 2 || this.hitTopCount === 2) {
          this.scrollCompleted = true;
          this.complete();
        }
      }, SCROLL_STOPPED_TIMEOUT)
    }
  }

  restart() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.start();
  }

  complete() {
    if (this.onePromise) return;

    this.promiseCompleted = false;

    let promise = this.onComplete();
    if (!(promise instanceof Promise)) {
      promise = new Promise((resolve) => {
        resolve();
      });
    }

    promise.then(() => {
      this.promiseCompleted = true;
    })

    this.onePromise = promise;
  }

  isCompleted() {
    return this.scrollCompleted && this.promiseCompleted;
  }
}
