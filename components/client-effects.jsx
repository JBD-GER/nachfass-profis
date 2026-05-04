"use client";

import { useEffect } from "react";

export function ClientEffects() {
  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll(".reveal"));
    const header = document.querySelector("[data-site-header]");
    const dashboardCard = document.querySelector("[data-dashboard-card]");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const cleanup = [];

    if (prefersReducedMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        {
          threshold: 0.16,
        },
      );

      revealElements.forEach((element) => revealObserver.observe(element));
      cleanup.push(() => revealObserver.disconnect());

      if (dashboardCard && window.matchMedia("(hover: hover)").matches) {
        const onPointerMove = (event) => {
          const bounds = dashboardCard.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          const rotateY = (x - 0.5) * 12;
          const rotateX = (0.5 - y) * 12;

          dashboardCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        };

        const onPointerLeave = () => {
          dashboardCard.style.transform = "rotateX(0deg) rotateY(0deg)";
        };

        dashboardCard.addEventListener("pointermove", onPointerMove);
        dashboardCard.addEventListener("pointerleave", onPointerLeave);
        cleanup.push(() => {
          dashboardCard.removeEventListener("pointermove", onPointerMove);
          dashboardCard.removeEventListener("pointerleave", onPointerLeave);
        });
      }
    }

    const toggleHeaderState = () => {
      if (!header) {
        return;
      }

      header.classList.toggle("is-scrolled", window.scrollY > 16);
    };

    toggleHeaderState();
    window.addEventListener("scroll", toggleHeaderState, { passive: true });
    cleanup.push(() =>
      window.removeEventListener("scroll", toggleHeaderState),
    );

    return () => {
      cleanup.forEach((fn) => fn());
    };
  }, []);

  return null;
}
