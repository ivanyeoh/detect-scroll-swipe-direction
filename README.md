# Detect scroll & swipe direction

## Usage

Install

```
npm install detect-scroll-swipe-direction --save
```

Import

```javascript
import detectScrollSwipeDirection from 'detect-scroll-swipe-direction';

detectScrollSwipeDirection(document)((direction) => {
  console.log('direction has changed', direction);

  // Optional: return a promise object if you need to lock scroll e.g. until animation complete
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1000);
  });
});
```
