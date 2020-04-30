const isTouchSupported =
  window.DocumentTouch && document instanceof DocumentTouch;
const SCROLL_STOPPED_TIMEOUT = isTouchSupported ? 500 : 50;

export default function detectScrollSwipeDirection(
  elementToScrollSwipe = document
) {
  let firstTouchX = null;
  let firstTouchY = null;
  let scrolling = null;

  return (callback) => {
    elementToScrollSwipe.addEventListener(
      "wheel",
      (e) => {
        if (scrolling && !scrolling.isCompleted()) {
          scrolling.restart();
          return;
        }

        scrolling = new Scrolling(elementToScrollSwipe, e.target, () => {
          const direction = getDirection(e);
          if (direction === "tap") return;

          return callback(direction, e);
        });
      },
      { passive: true }
    );

    elementToScrollSwipe.addEventListener(
      "touchstart",
      (e) => {
        const { screenX, screenY } = e.touches[0];
        firstTouchX = screenX;
        firstTouchY = screenY;
      },
      { passive: true }
    );

    elementToScrollSwipe.addEventListener(
      "touchend",
      (e) => {
        if (!firstTouchX || !firstTouchY) return;

        if (scrolling && !scrolling.isCompleted()) {
          scrolling.restart();
          return;
        }

        scrolling = new Scrolling(elementToScrollSwipe, e.target, () => {
          const { screenX, screenY } = e.changedTouches[0];
          const deltaX = firstTouchX - screenX;
          const deltaY = firstTouchY - screenY;

          firstTouchX = null;
          firstTouchY = null;

          const direction = getDirection({ deltaX, deltaY });
          if (direction === "tap") return;

          return callback(direction, e);
        });
      },
      { passive: true }
    );
  };
}

function getDirection({ deltaX, deltaY }) {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX === 0) return "tap";
    if (deltaX < 0) return "left";
    return "right";
  }

  if (deltaY === 0) return "tap";
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
    return (
      this.scrollParent.clientHeight + this.scrollParent.scrollTop >=
      this.scrollParent.scrollHeight
    );
  }

  hasScrollbar(elem) {
    if (elem.clientHeight < elem.scrollHeight) return true;
    return false;
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
    // const { scrollParent, expectedParent } = this;

    // if (
    //     JSON.stringify(expectedParent.getBoundingClientRect()) !==
    //         JSON.stringify(scrollParent.getBoundingClientRect()) &&
    //     this.hasScrollbar(scrollParent)
    // ) {
    //     this.timer = setTimeout(() => {
    //         this.timer2 = setTimeout(() => {
    //             if (this.hasHitTop()) this.hitTopCount++;
    //             if (this.hasHitBottom()) this.hitBottomCount++;

    //             if (this.hitBottomCount === 2 || this.hitTopCount === 2) {
    //                 this.scrollCompleted = true;
    //                 this.complete();
    //             }
    //         }, isTouchSupported ? SCROLL_STOPPED_TIMEOUT : 0); // ios elastic bounce :(
    //     }, SCROLL_STOPPED_TIMEOUT);
    // } else {
    this.timer = setTimeout(() => {
      this.scrollCompleted = true;
      this.complete();
    }, SCROLL_STOPPED_TIMEOUT);
    // }
  }

  restart() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.timer2) {
      clearTimeout(this.timer2);
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
    });

    this.onePromise = promise;
  }

  isCompleted() {
    return this.scrollCompleted && this.promiseCompleted;
  }
}
