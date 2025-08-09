// Site Preloader functionality
function initSitePreloader() {
  const preloader = document.getElementById('sitePreloader');
  const progressNumber = document.getElementById('progressNumber');
  const preloaderBorder = preloader.querySelector('.viewport-borders .border');
  
  if (!preloader || !progressNumber) return;
  
  // Create viewport border for preloader using same system
  if (preloaderBorder) {
    createViewportBorderForElement(preloaderBorder);
  }
  
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 2 + 0.5;
    if (progress > 100) progress = 100;
    
    progressNumber.textContent = Math.floor(progress);
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 1s ease';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 1000);
      }, 500);
    }
  }, 50);
}

// Create viewport border for a specific element
function createViewportBorderForElement(borderElement) {
  const { width, height } = responsiveConfig;
  
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", `${width}px`);
  svg.setAttribute("height", `${height}px`);
  svg.setAttribute("fill", "none");
  svg.setAttribute("xml:space", "preserve");

  // Create path elements
  const pathTop = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathTop.setAttribute("d", `M${width * 0.97},0.5h-${width * 0.33}c-2.3,0-4.4,0.9-6,2.5L${width * 0.6},42c-1.8,1.8-4.2,2.8-6.7,2.8H${width * 0.33}c-2.5,0-4.9-1-6.7-2.8L${width * 0.18},3c-1.6-1.6-3.8-2.5-6-2.5H${width * 0.03}`);

  // Create lines
  const lineRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
  lineRight.setAttribute("x1", width - 0.5);
  lineRight.setAttribute("y1", height * 0.97);
  lineRight.setAttribute("x2", width - 0.5);
  lineRight.setAttribute("y2", height * 0.03);

  const lineBottom = document.createElementNS("http://www.w3.org/2000/svg", "line");
  lineBottom.setAttribute("x1", width * 0.03);
  lineBottom.setAttribute("y1", height - 0.5);
  lineBottom.setAttribute("x2", width * 0.97);
  lineBottom.setAttribute("y2", height - 0.5);

  const lineLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
  lineLeft.setAttribute("x1", 0.5);
  lineLeft.setAttribute("y1", height * 0.03);
  lineLeft.setAttribute("x2", 0.5);
  lineLeft.setAttribute("y2", height * 0.97);

  // Create corner polylines
  const corners = [
    `0.5,15 0.6,9.2 9.3,0.5 15,0.5`,
    `${width * 0.98},0.5 ${width * 0.987},0.5 ${width - 0.5},9.2 ${width - 0.5},15`,
    `${width - 0.5},${height - 15} ${width - 0.5},${height - 9.2} ${width * 0.987},${height - 0.5} ${width * 0.98},${height - 0.5}`,
    `15,${height - 0.5} 9.2,${height - 0.5} 0.5,${height - 9.2} 0.5,${height - 15}`
  ];

  corners.forEach(points => {
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points);
    svg.appendChild(polyline);
  });

  svg.appendChild(pathTop);
  svg.appendChild(lineRight);
  svg.appendChild(lineBottom);
  svg.appendChild(lineLeft);

  borderElement.appendChild(svg);
}

// Circular Futuristic Navigation Menu
const menuItems = [
  { label: "Vision", icon: "scan-sharp", href: "#vision" },
  { label: "Portfolio", icon: "layers-sharp", href: "#portfolio" },
  { label: "People", icon: "person-sharp", href: "#people" },
  { label: "Insights", icon: "browsers-sharp", href: "#insights" },
  { label: "Careers", icon: "stats-chart-sharp", href: "#careers" },
  { label: "About Us", icon: "reader-sharp", href: "#about" },
];

let isOpen = false;
let isMenuAnimating = false;
let responsiveConfig = {};
let borderAnimationRef = null;
let dragToStartActive = true;
let dragProgress = 0;
let isDragging = false;
let dragStartX = 0;
let currentDragX = 0;

// Drag to Start functionality
function initDragToStart() {
  const dragToStart = document.querySelector('.drag-to-start');
  const dragHandle = document.querySelector('.drag-handle');
  const dragBounds = document.querySelector('.drag-bounds');
  const dragRipple = document.querySelector('.drag-ripple');
  const dragEnd = document.querySelector('.drag-end');
  
  if (!dragToStart || !dragHandle || !dragBounds) return;
  
  const boundsWidth = 280; // Fixed width from CSS
  const maxDragDistance = boundsWidth * 0.7; // 70% of bounds width
  
  let animationFrame;
  
  function updateDragProgress() {
    const progressPercent = Math.min(dragProgress / maxDragDistance, 1);
    
    // Update drag handle position
    gsap.set(dragHandle, {
      x: dragProgress
    });
    
    // Update progress indicator
    gsap.set(dragEnd, {
      x: dragProgress * 0.5
    });
    
    // Update ripple effect based on progress
    if (progressPercent > 0.1) {
      gsap.to(dragRipple, {
        opacity: progressPercent * 0.3,
        scale: 1 + progressPercent * 0.2,
        duration: 0.2
      });
    } else {
      gsap.to(dragRipple, {
        opacity: 0,
        scale: 1,
        duration: 0.2
      });
    }
    
    // Check if drag is complete
    if (progressPercent >= 1 && isDragging) {
      completeDragToStart();
    }
  }
  
  function completeDragToStart() {
    if (!dragToStartActive) return;
    
    dragToStartActive = false;
    
    // Animate completion without opening menu
    gsap.to(dragToStart, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Reset drag component instead of hiding it
        dragToStartActive = true;
        dragProgress = 0;
        gsap.set(dragHandle, { x: 0 });
        gsap.set(dragEnd, { x: 0 });
        gsap.set(dragRipple, { opacity: 0, scale: 1 });
        gsap.to(dragToStart, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
    
    // Success feedback
    gsap.to(dragRipple, {
      opacity: 1,
      scale: 2,
      duration: 0.3,
      ease: "power2.out"
    });
  }
  
  function startDrag(e) {
    if (!dragToStartActive) return;
    
    isDragging = true;
    dragStartX = e.clientX || e.touches?.[0]?.clientX || 0;
    currentDragX = dragStartX;
    
    // Add grab effect
    gsap.to(dragHandle, {
      scale: 1.1,
      duration: 0.2,
      ease: "power2.out"
    });
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    e.preventDefault();
  }
  
  function onDrag(e) {
    if (!isDragging || !dragToStartActive) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const deltaX = clientX - dragStartX;
    
    // Constrain drag within bounds
    dragProgress = Math.max(0, Math.min(deltaX, maxDragDistance));
    
    updateDragProgress();
    e.preventDefault();
  }
  
  function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    
    // Reset handle scale
    gsap.to(dragHandle, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
    
    // If not complete, animate back to start
    if (dragProgress < maxDragDistance) {
      gsap.to({ progress: dragProgress }, {
        progress: 0,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: function() {
          dragProgress = this.targets()[0].progress;
          updateDragProgress();
        }
      });
      
      // Fade out ripple
      gsap.to(dragRipple, {
        opacity: 0,
        scale: 1,
        duration: 0.3
      });
    }
    
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', endDrag);
  }
  
  // Event listeners
  dragHandle.addEventListener('mousedown', startDrag);
  dragHandle.addEventListener('touchstart', startDrag, { passive: false });
  
  // Keyboard accessibility - removed auto menu opening
  dragToStart.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Just complete the drag animation without opening menu
      completeDragToStart();
      e.preventDefault();
    }
  });
  
  // Initial animation
  gsap.fromTo(dragToStart, 
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1, delay: 1, ease: "power2.out" }
  );
}

// Viewport border calculations and rendering
function getViewportBorderSize() {
  return {
    sizeX: window.innerWidth,
    sizeY: window.innerHeight
  };
}

function createViewportBorder() {
  const borderContainer = document.querySelector('.viewport-borders .border');
  if (!borderContainer) return;

  const { sizeX: y, sizeY: b } = getViewportBorderSize();
  const isMobile = window.innerWidth < 768;
  
  // Size calculations for adaptive positioning
  const A = y / 2; // Center point
  const E = (isMobile ? 7 : 3) * y / 100; // Edge padding
  const x = 28; // Fixed offset
  const w = 42; // Vertical offset for path
  const T = isMobile ? 60 : 120; // Section width
  const S = 8.4991; // Fixed segment
  const D = A - E; // Distance calculation
  
  // Create SVG with calculated dimensions
  const svgContent = `
    <svg viewBox="0 0 ${y} ${b}" width="${y}px" height="${b}px" fill="none" xml:space="preserve">
      <path class="st0" d="M${y-E},0.5h-${Math.max(0, D-T-x-1.8*S)}c-2.3,0-4.4,0.9-6,2.5L${D+E+S-2+T},${w}c-1.8,1.8-4.2,2.8-6.7,2.8H${y-D-E-T}c-2.5,0-4.9-1-6.7-2.8L${y-D-E-S-T-x},3c-1.6-1.6-3.8-2.5-6-2.5H${E}" style="visibility: inherit;"></path>
      <line x1="${y - 0.5}" y1="${b - E}" x2="${y - 0.5}" y2="${E}" style="visibility: inherit;"></line>
      <line class="bottom" x1="${E}" y1="${b - 0.5}" x2="${y - E}" y2="${b - 0.5}" style="visibility: inherit;"></line>
      <line x1="0.5" y1="${E}" x2="0.5" y2="${b - E}" style="visibility: inherit;"></line>
      <polyline points="0.5,15 0.6,9.2 9.3,0.5 15,0.5" style="visibility: inherit;"></polyline>
      <polyline points="${y-0.5-14.5},0.5 ${y-0.5-8.7},0.5 ${y-0.5},9.2 ${y-0.5},15" style="visibility: inherit;"></polyline>
      <polyline points="${y-0.5},${b-0.5-14.5} ${y-0.5},${b-0.5-8.7} ${y-0.5-8.7},${b-0.5} ${y-0.5-14.5},${b-0.5}" style="visibility: inherit;"></polyline>
      <polyline points="15,${b-0.5} 9.2,${b-0.5} 0.5,${b-0.5-8.7} 0.5,${b-0.5-14.5}" style="visibility: inherit;"></polyline>
    </svg>
  `;
  
  borderContainer.innerHTML = svgContent;
  
  // Initialize animations
  initBorderAnimations();
}

function initBorderAnimations() {
  const border = document.querySelector('.viewport-borders .border');
  if (!border) return;
  
  const paths = border.querySelectorAll('path, line');
  const polylines = border.querySelectorAll('polyline');
  
  // Initial animation timeline
  const tl = gsap.timeline();
  
  // Fade in polylines first
  tl.fromTo(polylines, 
    { autoAlpha: 0 }, 
    { autoAlpha: 1, stagger: 0.05, duration: 0.4, ease: "power2.inOut" }, 
    0.2
  );
  
  // Then fade in paths and lines
  tl.fromTo(paths, 
    { autoAlpha: 0 }, 
    { 
      autoAlpha: 0.2, 
      stagger: 0.1, 
      ease: "power2.inOut", 
      duration: 0.3,
      onComplete: startBlinkingAnimation
    }, 
    0.3
  );
}

function startBlinkingAnimation() {
  const border = document.querySelector('.viewport-borders .border');
  if (!border) return;
  
  const paths = border.querySelectorAll('path, line');
  const polylines = border.querySelectorAll('polyline');
  
  // Create repeating blink animation
  borderAnimationRef = gsap.timeline({ repeat: -1, repeatRefresh: true });
  
  borderAnimationRef.to(polylines, {
    autoAlpha: 0.5,
    ease: "power2.inOut",
    stagger: 0.05,
    duration: 0.4,
    clearProps: "opacity"
  }, gsap.utils.random(1.5, 2.5));
  
  borderAnimationRef.to(paths, {
    autoAlpha: 0.4,
    ease: "power2.inOut",
    stagger: 0.1,
    duration: 0.3,
    clearProps: "opacity"
  }, gsap.utils.random(2.5, 4.5));
}

function updateViewportBorder() {
  // Kill existing animation
  if (borderAnimationRef) {
    borderAnimationRef.kill();
    borderAnimationRef = null;
  }
  
  // Recreate border with new dimensions
  createViewportBorder();
}

function getResponsiveConfig() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isMobile = viewportWidth < 1000;

  const maxSize = Math.min(viewportWidth * 0.9, viewportHeight * 0.9);
  const menuSize = isMobile ? Math.min(maxSize, 480) : 700;

  return {
    menuSize,
    center: menuSize / 2,
    innerRadius: menuSize * 0.08,
    outerRadius: menuSize * 0.42,
    contentRadius: menuSize * 0.28,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize site preloader
  initSitePreloader();
  
  responsiveConfig = getResponsiveConfig();

  // Initialize viewport border
  createViewportBorder();
  
  // Initialize drag to start component
  initDragToStart();

  const menu = document.querySelector(".circular-menu");
  const joystick = document.querySelector(".joystick");
  const menuOverlayNav = document.querySelector(".menu-overlay-nav");
  const menuOverlayFooter = document.querySelector(".menu-overlay-footer");

  menu.style.width = `${responsiveConfig.menuSize}px`;
  menu.style.height = `${responsiveConfig.menuSize}px`;

  gsap.set(joystick, { scale: 0 });
  gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 0 });
  
  // Ensure menu overlay starts hidden
  const menuOverlay = document.querySelector(".menu-overlay");
  gsap.set(menuOverlay, { opacity: 0 });
  menuOverlay.style.pointerEvents = "none";

  menuItems.forEach((item, index) => {
    const segment = createSegment(item, index, menuItems.length);
    segment.addEventListener("mouseenter", () => {
      if (isOpen) {
        new Audio("/public/menu-select.mp3").play().catch(() => {});
      }
    });
    menu.appendChild(segment);
  });

  document
    .querySelector(".menu-toggle-btn")
    .addEventListener("click", toggleMenu);
  document.querySelector(".close-btn").addEventListener("click", toggleMenu);
  
  // Close menu when clicking on overlay background
  document.querySelector(".menu-overlay").addEventListener("click", (e) => {
    if (e.target.classList.contains("menu-overlay") || e.target.classList.contains("menu-bg")) {
      if (isOpen) {
        toggleMenu();
      }
    }
  });

  initCenterDrag();
});

function createSegment(item, index, total) {
  const segment = document.createElement("a");
  segment.className = "menu-segment";
  segment.href = item.href;

  const { menuSize, center, innerRadius, outerRadius, contentRadius } =
    responsiveConfig;

  const anglePerSegment = 360 / total;
  const baseStartAngle = anglePerSegment * index;
  const centerAngle = baseStartAngle + anglePerSegment / 2;
  const startAngle = baseStartAngle + 0.19;
  const endAngle = baseStartAngle + anglePerSegment - 0.19;

  const innerStartX =
    center + innerRadius * Math.cos(((startAngle - 90) * Math.PI) / 180);
  const innerStartY =
    center + innerRadius * Math.sin(((startAngle - 90) * Math.PI) / 180);
  const outerStartX =
    center + outerRadius * Math.cos(((startAngle - 90) * Math.PI) / 180);
  const outerStartY =
    center + outerRadius * Math.sin(((startAngle - 90) * Math.PI) / 180);
  const innerEndX =
    center + innerRadius * Math.cos(((endAngle - 90) * Math.PI) / 180);
  const innerEndY =
    center + innerRadius * Math.sin(((endAngle - 90) * Math.PI) / 180);
  const outerEndX =
    center + outerRadius * Math.cos(((endAngle - 90) * Math.PI) / 180);
  const outerEndY =
    center + outerRadius * Math.sin(((endAngle - 90) * Math.PI) / 180);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  const pathData = [
    `M ${innerStartX} ${innerStartY}`,
    `L ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
    "Z",
  ].join(" ");

  segment.style.clipPath = `path('${pathData}')`;
  segment.style.width = `${menuSize}px`;
  segment.style.height = `${menuSize}px`;

  const contentX =
    center + contentRadius * Math.cos(((centerAngle - 90) * Math.PI) / 180);
  const contentY =
    center + contentRadius * Math.sin(((centerAngle - 90) * Math.PI) / 180);

  segment.innerHTML = `
    <div class="segment-content" 
      style="left: ${contentX}px; top: ${contentY}px; transform: translate(-50%, -50%);">
      <ion-icon name="${item.icon}"></ion-icon>
      <div class="label">${item.label}</div>
    </div>
  `;

  return segment;
}

function toggleMenu() {
  if (isMenuAnimating) return;

  const menuOverlay = document.querySelector(".menu-overlay");
  const menuSegments = document.querySelectorAll(".menu-segment");
  const joystick = document.querySelector(".joystick");
  const menuOverlayNav = document.querySelector(".menu-overlay-nav");
  const menuOverlayFooter = document.querySelector(".menu-overlay-footer");

  isMenuAnimating = true;

  if (!isOpen) {
    isOpen = true;
    new Audio("/public/menu-open.mp3").play();

    // Hide drag component when menu opens
    const dragToStart = document.querySelector('.drag-to-start');
    gsap.to(dragToStart, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(menuOverlay, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
      onStart: () => (menuOverlay.style.pointerEvents = "all"),
    });

    gsap.to(joystick, {
      scale: 1,
      duration: 0.4,
      delay: 0.2,
      ease: "back.out(1.7)",
    });

    gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 0 });
    gsap.to([menuOverlayNav, menuOverlayFooter], {
      opacity: 1,
      duration: 0.075,
      delay: 0.3,
      repeat: 3,
      yoyo: true,
      ease: "power2.inOut",
      onComplete: () =>
        gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 1 }),
    });

    [...Array(menuSegments.length).keys()]
      .sort(() => Math.random() - 0.5)
      .forEach((originalIndex, shuffledPosition) => {
        const segment = menuSegments[originalIndex];
        gsap.set(segment, { opacity: 0 });
        gsap.to(segment, {
          opacity: 1,
          duration: 0.075,
          delay: shuffledPosition * 0.075,
          repeat: 3,
          yoyo: true,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(segment, { opacity: 1 });
            if (originalIndex === menuSegments.length - 1) {
              isMenuAnimating = false;
            }
          },
        });
      });
  } else {
    isOpen = false;
    new Audio("/public/menu-close.mp3").play();

    gsap.to([menuOverlayNav, menuOverlayFooter], {
      opacity: 0,
      duration: 0.05,
      repeat: 2,
      yoyo: true,
      ease: "power2.inOut",
      onComplete: () =>
        gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 0 }),
    });

    gsap.to(joystick, {
      scale: 0,
      duration: 0.3,
      delay: 0.2,
      ease: "back.in(1.7)",
    });

    [...Array(menuSegments.length).keys()]
      .sort(() => Math.random() - 0.5)
      .forEach((originalIndex, shuffledPosition) => {
        const segment = menuSegments[originalIndex];
        gsap.to(segment, {
          opacity: 0,
          duration: 0.05,
          delay: shuffledPosition * 0.05,
          repeat: 2,
          yoyo: true,
          ease: "power2.inOut",
          onComplete: () => gsap.set(segment, { opacity: 0 }),
        });
      });

    gsap.to(menuOverlay, {
      opacity: 0,
      duration: 0.3,
      delay: 0.6,
      ease: "power2.out",
      onComplete: () => {
        menuOverlay.style.pointerEvents = "none";
        isMenuAnimating = false;
        
        // Show drag component when menu closes
        const dragToStart = document.querySelector('.drag-to-start');
        gsap.to(dragToStart, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      },
    });
  }
}

function initCenterDrag() {
  const joystick = document.querySelector(".joystick");
  let isDragging = false;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let activeSegment = null;

  function animate() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    gsap.set(joystick, {
      x: currentX,
      y: currentY,
    });

    if (
      isDragging &&
      Math.sqrt(currentX * currentX + currentY * currentY) > 20
    ) {
      const angle = Math.atan2(currentY, currentX) * (180 / Math.PI);
      const segmentIndex =
        Math.floor(((angle + 90 + 360) % 360) / (360 / menuItems.length)) %
        menuItems.length;
      const segment = document.querySelectorAll(".menu-segment")[segmentIndex];

      if (segment !== activeSegment) {
        if (activeSegment) {
          activeSegment.style.animation = "";
          activeSegment.querySelector(".segment-content").style.animation = "";
          activeSegment.style.zIndex = "";
        }
        activeSegment = segment;
        segment.style.animation = "flickerHover 350ms ease-in-out forwards";
        segment.querySelector(".segment-content").style.animation =
          "contentFlickerHover 350ms ease-in-out forwards";
        segment.style.zIndex = "10";
        if (isOpen) {
          new Audio("/public/menu-select.mp3").play().catch(() => {});
        }
      }
    } else {
      if (activeSegment) {
        activeSegment.style.animation = "";
        activeSegment.querySelector(".segment-content").style.animation = "";
        activeSegment.style.zIndex = "";
        activeSegment = null;
      }
    }

    requestAnimationFrame(animate);
  }

  joystick.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    function drag(e) {
      if (!isDragging) return;
      const deltaX = (e.clientX || e.touches[0]?.clientX) - centerX;
      const deltaY = (e.clientY || e.touches[0]?.clientY) - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDrag = 100 * 0.25;

      if (distance <= 20) {
        targetX = targetY = 0;
      } else if (distance > maxDrag) {
        const ratio = maxDrag / distance;
        targetX = deltaX * ratio;
        targetY = deltaY * ratio;
      } else {
        targetX = deltaX;
        targetY = deltaY;
      }
      e.preventDefault();
    }

    function endDrag() {
      isDragging = false;
      targetX = targetY = 0;
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", endDrag);
    }

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", endDrag);
    e.preventDefault();
  });

  animate();
}

window.addEventListener('resize', () => {
  // Update on resize
  responsiveConfig = getResponsiveConfig();
  updateViewportBorder();
  const menu = document.querySelector(".circular-menu");
  menu.style.width = `${responsiveConfig.menuSize}px`;
  menu.style.height = `${responsiveConfig.menuSize}px`;
  
  // Reset drag-to-start on resize if still active
  if (dragToStartActive) {
    dragProgress = 0;
    const dragHandle = document.querySelector('.drag-handle');
    const dragEnd = document.querySelector('.drag-end');
    const dragRipple = document.querySelector('.drag-ripple');
    
    if (dragHandle) gsap.set(dragHandle, { x: 0 });
    if (dragEnd) gsap.set(dragEnd, { x: 0 });
    if (dragRipple) gsap.set(dragRipple, { opacity: 0, scale: 1 });
  }
});
