import scrollSwipeDirection from "./index.js"

function inSight(element, inSightCallback, outOfSightCallback = () => { }, percentInView = 50) {
  var observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              inSightCallback();
          } else {
              outOfSightCallback();
          }
      });
  }, {
      threshold: percentInView / 100
  });
  observer.observe(element);

  return () => {
      observer.unobserve(element);
  };
};

function smoothScroll(element) {
  element.scrollIntoView({ behavior: 'smooth' });
}

function getScrollParent(node) {
  if (node == null) {
    return null;
  }

  if (node.scrollHeight > node.clientHeight) {
    return node;
  } else {
    return getScrollParent(node.parentNode);
  }
}

function scrollHitEnd(e) {
  const { clientHeight, scrollTop, scrollHeight } = e.target;
  const hitBottom = (clientHeight + scrollTop) >= scrollHeight;
  const hitTop = scrollTop === 0;

  // console.log('hit', hitBottom, hitTop)

  if (hitBottom) {
    // console.log('hitbottom lor')
    e.target.dataset.hitBottom = parseInt(e.target.dataset.hitBottom || 0) + 1;
    // e.target.removeEventListener('scroll', scrollHitEnd)
  } else {
    // console.log('why no hitbottom?', clientHeight, scrollTop, scrollHeight)
  }
}

const slideshows = document.querySelector('.slideshows');
scrollSwipeDirection(slideshows)((direction, e) => {
  console.log(direction)
  if (!['up', 'down'].includes(direction)) return;

  const activeSlide = slideshows.querySelector('.slideshow > div.active');
  if (!activeSlide) return

  const currentSlideshow = activeSlide.closest('.slideshow');
  const currentSlides = [...currentSlideshow.children];

  if (currentSlides.indexOf(activeSlide) === 0) return;

  return new Promise((resolve) => {
    let nextSlide;
    if (direction === 'down') {
      nextSlide = currentSlideshow.nextElementSibling;
    } else if (direction === 'up') {
      nextSlide = currentSlideshow.previousElementSibling;
    }

    if (!nextSlide) return resolve();

    const firstSlide = currentSlides[0];
    const unobserve = inSight(firstSlide, () => {
      setTimeout(() => {
        smoothScroll(nextSlide);
        unobserve();
        resolve();
      }, 300);
    }, () => {}, 50);

    smoothScroll(firstSlide);
  });
})

document.querySelectorAll('.slideshow > div').forEach((slide) => {
  inSight(slide, () => {
    slide.classList.add('active');
    if ([...slide.closest('.slideshow').children].indexOf(slide) === 0) {
      slideshows.classList.remove('noScrollUpDown');
    } else {
      slideshows.classList.add('noScrollUpDown');
    }
  }, () => {
    slide.classList.remove('active')
  }, 85);
})