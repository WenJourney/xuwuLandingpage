const header = document.querySelector(".site-header");
const motionTargets = document.querySelectorAll("[data-motion], [data-motion-item]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  },
);

motionTargets.forEach((target) => {
  target.classList.add("will-reveal");
  revealObserver.observe(target);
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
});

/*
  Motion integration plan:
  - data-motion marks page sections that can receive reveal or scroll-triggered animation.
  - data-motion-item marks repeated elements, such as product cards, for staggered animation.
  - data-motion-slot marks areas reserved for richer components, such as Three.js scenes,
    Lottie animations, GSAP timelines, or future framework-mounted widgets.
*/
