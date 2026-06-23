import { useEffect, useRef, type CSSProperties } from "react";

interface GooeyTextProps {
  /** 轮流互换的文本，例如 ["美，自有序", "THE ORDER OF BEAUTY"] */
  texts: string[];
  /** 单次黏稠融合时长(秒) */
  morphTime?: number;
  /** 每种语言停留时长(秒) */
  cooldownTime?: number;
  /** 入场后延迟多久才开始黏稠互换(秒)，期间静态显示第一个文本 */
  startDelay?: number;
  /** 文字颜色，默认品牌红 */
  color?: string;
  /** 英文字体栈 */
  fontEn?: string;
  /** 中文字体栈 */
  fontCn?: string;
  /** 外层容器额外类名 */
  className?: string;
  /** 文字额外类名(字号/字重等) */
  textClassName?: string;
}

const CJK = /[　-〿㐀-䶿一-鿿＀-￯]/;

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 1.2,
  startDelay = 0,
  color = "var(--brand)",
  fontEn = "var(--font-en)",
  fontCn = "var(--font-cn)",
  className,
  textClassName,
}: GooeyTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const text1 = text1Ref.current;
    const text2 = text2Ref.current;
    const container = containerRef.current;
    if (!text1 || !text2 || !container) return;

    // 按内容自动选字体：含 CJK 用中文字体栈，否则用英文字体栈
    const applyFont = (el: HTMLSpanElement, value: string) => {
      const isCjk = CJK.test(value);
      el.textContent = value;
      el.style.fontFamily = isCjk ? fontCn : fontEn;
      // 给中/英分别打标记，便于 CSS 单独控制字号(如手机端缩小英文)
      el.classList.toggle("gooey-cjk", isCjk);
      el.classList.toggle("gooey-latin", !isCjk);
    };

    let textIndex = texts.length - 1;
    let time = performance.now();
    const startAt = time + startDelay * 1000;
    let morph = 0;
    // 初始停留设为极小正值:首次启动时间完全由 startDelay 决定(不再叠加一整个 cooldownTime);
    // 极小正值保证第一次 morph 仍会自增索引、方向正确(中→英)。后续停留正常用 cooldownTime。
    let cooldown = 0.0001;
    let running = true;

    const blurPx = (f: number) => Math.min(8 / f - 8, 50);

    const setMorph = (fraction: number) => {
      text2.style.filter = `blur(${blurPx(fraction)}px)`;
      text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const inv = 1 - fraction;
      text1.style.filter = `blur(${blurPx(inv)}px)`;
      text1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
    };

    const doCooldown = () => {
      morph = 0;
      // 用 blur(0) 而非 "" 保持合成图层稳定,避免反复装卸滤镜导致闪烁
      text2.style.filter = "blur(0px)";
      text2.style.opacity = "100%";
      text1.style.filter = "blur(0px)";
      text1.style.opacity = "0%";
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      setMorph(fraction);
    };

    // 初始静态显示第一个文本，避免最初空白；后续 morph 从它开始无缝衔接
    applyFont(text1, texts[textIndex % texts.length]);
    applyFont(text2, texts[(textIndex + 1) % texts.length]);
    doCooldown();

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const newTime = performance.now();
      // 入场延迟期间保持静态，等淡入上移结束后再开始黏稠互换
      if (newTime < startAt) {
        time = newTime;
        return;
      }
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime - time) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          applyFont(text1, texts[textIndex % texts.length]);
          applyFont(text2, texts[(textIndex + 1) % texts.length]);
        }
        doMorph();
      } else {
        doCooldown();
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      time = performance.now();
      raf = requestAnimationFrame(animate);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // 仅在首屏可见时运行，滚走后暂停，避免空耗
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(container);

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [texts, morphTime, cooldownTime, startDelay, color, fontEn, fontCn]);

  const spanStyle: CSSProperties = {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    color,
    textAlign: "left",
    whiteSpace: "nowrap",
    willChange: "filter, opacity",
    backfaceVisibility: "hidden",
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="gooey-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 36 -14"
            />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          filter: "url(#gooey-threshold)",
          position: "absolute",
          inset: 0,
        }}
      >
        <span ref={text1Ref} className={textClassName} style={spanStyle} />
        <span ref={text2Ref} className={textClassName} style={spanStyle} />
      </div>
    </div>
  );
}
