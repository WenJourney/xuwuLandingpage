import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Iphone } from "@/components/ui/iphone";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setIsScrolled(window.scrollY > 12);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled);

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <motion.header
      className={`site-header ${isScrolled ? "is-scrolled" : ""}`}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nav-surface">
        <a className="brand" href="#top" aria-label="序物首页">
          <img src="/assets/logo.png" alt="产品 logo" className="brand-logo" />
        </a>

        <nav className="nav" aria-label="主导航">
          <a className="nav-link" href="#about">
            关于我们
          </a>
          <a className="nav-link" href="#contact">
            联系我们
          </a>
          <a className="nav-cta" href="#download">
            Download App
          </a>
        </nav>
      </div>
    </motion.header>
  );
}

const heroTextItems: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const heroTextItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

type PhoneItem = {
  id: string;
  scale: number;
  zIndex: number;
};

const phoneItems: PhoneItem[] = [
  { id: "phone-1", scale: 0.76, zIndex: 1 },
  { id: "phone-2", scale: 0.9, zIndex: 2 },
  { id: "phone-3", scale: 1, zIndex: 5 },
  { id: "phone-4", scale: 0.9, zIndex: 2 },
  { id: "phone-5", scale: 0.76, zIndex: 1 },
];

const MIN_LAYOUT_WIDTH = 390;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// 所有 >640 的偏方屏(横向矮屏 + 竖屏偏方/iPad 竖屏)都不再特殊处理,
// 一律落回默认整屏 hero + 正常宽度档的手机露出。

function getResponsivePhoneWidth(width: number, height: number) {
  const layoutWidth = Math.max(width, MIN_LAYOUT_WIDTH);

  if (layoutWidth >= 1600) {
    return clamp(Math.min(layoutWidth * 0.15, height * 0.38), 290, 350);
  }

  if (layoutWidth < 400) {
    // 320–399:hero 500px,小手机。
    return clamp(layoutWidth * 0.4, 132, 156);
  }

  if (layoutWidth <= 640) {
    // 400–640:hero 600px,手机更大(封顶 185)。与 CSS 的 43vw 同步。
    return clamp(layoutWidth * 0.43, 168, 185);
  }

  if (layoutWidth <= 920) {
    return clamp(Math.min(layoutWidth * 0.31, height * 0.31), 170, 235);
  }

  if (layoutWidth <= 1200) {
    return clamp(Math.min(layoutWidth * 0.21, height * 0.34), 205, 290);
  }

  return clamp(Math.min(layoutWidth * 0.17, height * 0.36), 220, 330);
}

function getResponsivePhoneGap(width: number) {
  const layoutWidth = Math.max(width, MIN_LAYOUT_WIDTH);

  if (layoutWidth <= 480) return clamp(layoutWidth * 0.018, 4, 9);
  if (layoutWidth <= 640) return clamp(layoutWidth * 0.022, 7, 13);
  if (layoutWidth <= 920) return clamp(layoutWidth * 0.028, 14, 24);
  if (layoutWidth <= 1200) return clamp(layoutWidth * 0.032, 24, 36);
  if (layoutWidth >= 1600) return clamp(layoutWidth * 0.03, 44, 58);

  return clamp(layoutWidth * 0.034, 34, 46);
}

function getPhoneOffsets(phoneWidth: number, edgeGap: number) {
  const nearOffset = edgeGap + phoneWidth * 0.95;
  const farOffset = edgeGap * 2 + phoneWidth * 1.78;

  return [-farOffset, -nearOffset, 0, nearOffset, farOffset];
}

function getMobilePhoneOffsets(phoneWidth: number, edgeGap: number) {
  const offset = phoneWidth * 0.50 + edgeGap;

  return [-offset, offset];
}

function getVisiblePhoneItems(width: number) {
  return Math.max(width, MIN_LAYOUT_WIDTH) <= 640 ? phoneItems.slice(1, 3) : phoneItems;
}

function getResponsivePhoneOffsets(width: number, height: number, gapMultiplier = 1) {
  const phoneWidth = getResponsivePhoneWidth(width, height);
  const edgeGap = getResponsivePhoneGap(width) * gapMultiplier;

  return getVisiblePhoneItems(width).length === 2
    ? getMobilePhoneOffsets(phoneWidth, edgeGap)
    : getPhoneOffsets(phoneWidth, edgeGap);
}

function getPhoneRevealDistance(width: number, height: number) {
  // 全局统一:首屏手机永远只露出一半(被遮挡一半)。
  // 露出距离 = 手机高度的一半 + 底距,使首屏可见量约为手机高度的 50%。
  // 手机高度仍按各断点尺寸计算,所以尺寸/数量/小屏 2 台等都不受影响。
  const phoneHeight = getResponsivePhoneWidth(width, height) * (882 / 433);
  return phoneHeight / 2 + 48;
}

function AppIcon() {
  return (
    <motion.div
      className="app-icon"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <img src="/assets/app-icon.png" alt="" />
    </motion.div>
  );
}

function PhoneMockup() {
  return <Iphone className="magic-iphone" src="/assets/phone-screen.jpg" aria-hidden="true" />;
}

function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [heroContentOpacity, setHeroContentOpacity] = useState(1);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [phoneOffsets, setPhoneOffsets] = useState(() => getPhoneOffsets(300, 54));
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const phoneRevealDistance = getPhoneRevealDistance(viewport.width, viewport.height);
  const phoneRevealY = useTransform(scrollYProgress, [0, 0.6, 1], [phoneRevealDistance, 0, 0]);
  const heroMotionOpacity = useTransform(scrollYProgress, [0.01, 0.50], [1, 0]);

  useEffect(() => {
    return heroMotionOpacity.on("change", setHeroContentOpacity);
  }, [heroMotionOpacity]);

  useEffect(() => {
    const updatePhoneOffsets = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({ width, height });
      setPhoneOffsets(getResponsivePhoneOffsets(width, height));
    };

    updatePhoneOffsets();
    window.addEventListener("resize", updatePhoneOffsets);

    return () => window.removeEventListener("resize", updatePhoneOffsets);
  }, []);

  const visiblePhoneItems = getVisiblePhoneItems(viewport.width);
  const initialPhoneOffsets = getResponsivePhoneOffsets(viewport.width, viewport.height, 3);

  return (
    <section className="hero hero-app" ref={heroRef}>
      <div className="hero-sticky">
        <div className="hero-glass-decor" aria-hidden="true" />
        <motion.div className="hero-app-content" style={{ opacity: heroContentOpacity }}>
          <AppIcon />
          <motion.div variants={heroTextItems} initial="hidden" animate="visible">
            <motion.p className="hero-kicker" variants={heroTextItem}>
              精致生活从序物开始
            </motion.p>
            <motion.h1 className="hero-app-title" variants={heroTextItem}>
              <span>Begin Your Refined</span>
              <span>Life with Xuwu</span>
            </motion.h1>
            <motion.p className="hero-app-copy hero-app-copy-cn" variants={heroTextItem}>
              专为亚洲女性打造精致生活
            </motion.p>
            <motion.p className="hero-app-copy hero-app-copy-en" variants={heroTextItem}>
              Curated for Asian Women’s Lifestyle
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div className="phone-stage" style={{ y: phoneRevealY }} aria-label="App screen previews">
          {visiblePhoneItems.map((phone, index) => (
            <motion.div
              className="phone-shell"
              key={phone.id}
              initial={{
                opacity: 0,
                y: 0,
                x: initialPhoneOffsets[index],
                scale: phone.scale,
              }}
              animate={{ opacity: 1, y: 0, x: phoneOffsets[index], scale: phone.scale }}
              transition={{
                duration: 1.65,
                delay: 0.72,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                zIndex: phone.zIndex,
              }}
            >
              <PhoneMockup />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section about" data-motion="about">
      <div className="about-heading">
        <p className="eyebrow">About Us</p>
        <h2 className="about-title-cn section-title-cn">关于序物</h2>
      </div>
      <div className="about-copy">
        <p>
          Xuwu is a curated lifestyle e-commerce platform created for Asian women. We bring together
          beauty, skincare, wellness, home, and everyday essentials with a focus on quality,
          aesthetics, and practical living. We believe a refined life begins with the small things —
          a skincare ritual, a comforting home detail, a carefully chosen daily product. At Xuwu,
          every item is selected to make everyday shopping feel simple, calm, and inspiring.
        </p>
        <p className="about-copy-cn">
          序物是一个专为北美亚洲女性打造的生活方式电商平台，精选美妆护肤、健康护理、家居生活与日常用品，注重品质、审美与实用性。我们相信，精致生活始于日常细节——一次舒适的护肤仪式，一件提升生活质感的小物，一个经过认真挑选的日用品。序物希望让每一次购物都变得轻松、舒适且富有灵感。
        </p>
      </div>
    </section>
  );
}

function Download() {
  return (
    <section id="download" className="section download" data-motion="download">
      <div className="download-copy">
        <div className="section-title-block">
          <p className="eyebrow">Mobile app</p>
          <h2 className="section-title-cn">下载序物 App</h2>
          <p className="download-note">打开手机相机，扫描二维码到应用商店下载序物App</p>
        </div>
        
      </div>
      <div className="qr-placeholders" aria-label="下载二维码占位图">
        <div className="qr-card">
          <div className="qr-pattern" aria-hidden="true" />
          <span>iOS</span>
        </div>
        <div className="qr-card">
          <div className="qr-pattern" aria-hidden="true" />
          <span>Android</span>
        </div>
      </div>
      
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="section contact" data-motion="contact">
      <div className="section-title-block">
        <p className="eyebrow">Contact</p>
        <h2 className="section-title-cn">联系我们</h2>
      </div>
      <div className="contact-list">
        <a href="mailto:hello@example.com">hello@example.com</a>
        <span>工作日 10:00 - 18:00</span>
        <span>50 Prince Andrew Pl, North York, ON M3C 2H4</span>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <span>© 2026 序物</span>
      <span>Plain, useful, long-lasting.</span>
    </footer>
  );
}

function useRevealOnScroll() {
  useEffect(() => {
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

    return () => revealObserver.disconnect();
  }, []);
}

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <About />
        <Download />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
