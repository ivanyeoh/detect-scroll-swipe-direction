import scrollSwipeDirection from "./index.js"

scrollSwipeDirection(document.querySelector('#left-right-slideshow'))((direction) => {
  console.log('direction', direction)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
})
