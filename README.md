# Detect scroll & swipe direction

Detect both desktop scroll and mobile swipe direction

## Usage

Install

```
npm install @ivanyeoh/detect-scroll-swipe-direction --save
```

Import

```javascript
import detectScrollSwipeDirection from '@ivanyeoh/detect-scroll-swipe-direction';

detectScrollSwipeDirection(document)((direction) => {
  console.log('direction has changed', direction);

  // Optional: return a promise object e.g. when you need to lock scroll until an animation complete
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
});
```
