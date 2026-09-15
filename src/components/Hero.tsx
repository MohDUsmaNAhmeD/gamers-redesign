import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const controllerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const controller = controllerRef.current;
    const content = contentRef.current;

    if (!hero || !controller || !content) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      /* ==========================================================
         INTRO ANIMATION
      ========================================================== */

      const intro = gsap.timeline({
        defaults: {
          ease: 'power4.out',
        },
      });

      intro
        .from('.hero-index', {
          y: -12,
          opacity: 0,
          duration: 0.5,
        })
        .from(
          '.hero-eyebrow',
          {
            y: 18,
            opacity: 0,
            duration: 0.55,
          },
          '-=0.2'
        )
        .from(
          '.hero-title-line',
          {
            yPercent: 115,
            opacity: 0,
            duration: 0.95,
            stagger: 0.1,
          },
          '-=0.2'
        )
        .from(
          '.hero-copy',
          {
            y: 20,
            opacity: 0,
            duration: 0.65,
          },
          '-=0.55'
        )
        .from(
          '.hero-button-wrap',
          {
            y: 18,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.45'
        )
        .from(
          '.hero-controller',
          {
            x: 120,
            y: 40,
            scale: 0.86,
            rotate: 7,
            opacity: 0,
            duration: 1.3,
          },
          '-=1'
        )
        .from(
          '.hero-product-tag',
          {
            x: 20,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.65'
        )
        .from(
          '.hero-rail',
          {
            y: 18,
            opacity: 0,
            duration: 0.55,
          },
          '-=0.4'
        );

      /* ==========================================================
         CONTROLLER FLOAT
      ========================================================== */

      gsap.to(controller, {
        y: '-=10',
        rotate: -1.2,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      /* ==========================================================
         SCROLL — TEXT
      ========================================================== */

      gsap.to(content, {
        y: -90,
        opacity: 0,
        ease: 'none',

        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      /* ==========================================================
         SCROLL — CONTROLLER
      ========================================================== */

      gsap.to(controller, {
        x: -120,
        y: -120,
        scale: 0.9,
        rotate: -7,
        ease: 'none',

        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      /* ==========================================================
         SCROLL — BACKGROUND
      ========================================================== */

      gsap.to('.hero-background-ring', {
        scale: 1.25,
        opacity: 0.12,
        ease: 'none',

        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      gsap.to('.hero-background-glow', {
        scale: 1.15,
        opacity: 0.65,
        ease: 'none',

        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }, hero);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <>
      <style>{`

        /* ==========================================================
           HERO
        ========================================================== */

        .hero-cinematic {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 760px;

          overflow: hidden;
          isolation: isolate;

          background: #080908;
          color: #ffffff;

          font-family: inherit;
        }

        /* ==========================================================
           BACKGROUND GRID
        ========================================================== */

        .hero-grid {
          position: absolute;
          inset: 0;

          z-index: -6;

          pointer-events: none;

          opacity: 0.30;

          background-image:
            linear-gradient(
              rgba(132, 255, 31, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(132, 255, 31, 0.045) 1px,
              transparent 1px
            );

          background-size: 72px 72px;

          mask-image:
            linear-gradient(
              to bottom,
              black 0%,
              black 48%,
              transparent 100%
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              black 0%,
              black 48%,
              transparent 100%
            );
        }

        /* ==========================================================
           BACKGROUND RING
        ========================================================== */

        .hero-background-ring {
          position: absolute;

          width: 780px;
          height: 780px;

          right: -20px;
          top: 50%;

          transform: translateY(-50%);

          z-index: -4;

          border-radius: 50%;

          border:
            1px solid
            rgba(132, 255, 31, 0.065);

          box-shadow:
            0 0 160px
            rgba(132, 255, 31, 0.025);

          pointer-events: none;
        }

        .hero-background-ring::before {
          content: '';

          position: absolute;

          inset: 90px;

          border:
            1px solid
            rgba(255, 255, 255, 0.028);

          border-radius: 50%;
        }

        .hero-background-ring::after {
          content: '';

          position: absolute;

          inset: 180px;

          border:
            1px solid
            rgba(132, 255, 31, 0.035);

          border-radius: 50%;
        }

        /* ==========================================================
           BACKGROUND GLOW
        ========================================================== */

        .hero-background-glow {
          position: absolute;

          width: 600px;
          height: 600px;

          right: 7%;
          top: 50%;

          transform: translateY(-50%);

          z-index: -7;

          border-radius: 50%;

          background:
            rgba(132, 255, 31, 0.035);

          filter: blur(120px);

          pointer-events: none;
        }

        /* ==========================================================
           VIGNETTE
        ========================================================== */

        .hero-vignette {
          position: absolute;
          inset: 0;

          z-index: 8;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              rgba(8, 9, 8, 0.97) 0%,
              rgba(8, 9, 8, 0.75) 26%,
              rgba(8, 9, 8, 0.28) 58%,
              rgba(8, 9, 8, 0.04) 82%
            ),
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.28),
              transparent 20%,
              transparent 78%,
              rgba(0, 0, 0, 0.72)
            );
        }

        /* ==========================================================
           STAGE
        ========================================================== */

        .hero-stage {
          position: relative;

          width: min(1600px, 100%);
          height: 100%;

          margin: 0 auto;

          padding:
            110px
            clamp(24px, 5vw, 85px)
            110px;

          box-sizing: border-box;
        }

        /* ==========================================================
           INDEX
        ========================================================== */

        .hero-index {
          position: absolute;

          left: clamp(24px, 5vw, 85px);
          top: 132px;

          display: flex;
          align-items: center;
          gap: 11px;

          z-index: 15;

          font-size: 9px;
          font-weight: 600;

          letter-spacing: 0.14em;

          color:
            rgba(255, 255, 255, 0.32);
        }

        .hero-index strong {
          color: #84ff1f;

          font-weight: 600;
        }

        .hero-index-line {
          width: 28px;
          height: 1px;

          background:
            rgba(255, 255, 255, 0.16);
        }

        /* ==========================================================
           CONTENT
        ========================================================== */

        .hero-content {
          position: absolute;

          left: clamp(24px, 5vw, 85px);
          bottom: 145px;

          z-index: 10;

          width: 600px;

          pointer-events: none;
        }

        /* ==========================================================
           EYEBROW
        ========================================================== */

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;

          margin:
            0 0 30px;

          font-size: 11px;
          font-weight: 600;

          letter-spacing: 0.18em;

          text-transform: uppercase;

          color: #84ff1f;
        }

        .hero-eyebrow::before {
          content: '';

          width: 18px;
          height: 1px;

          background:
            #84ff1f;
        }

        /* ==========================================================
           TITLE
        ========================================================== */

        .hero-title {
          margin: 0;

          font-size:
            clamp(
              76px,
              8.2vw,
              124px
            );

          font-weight: 700;

          line-height: 0.83;

          letter-spacing:
            -0.075em;

          text-transform: uppercase;
        }

        .hero-title-line {
          display: block;

          width: fit-content;

          overflow: hidden;
        }

        .hero-title-line:nth-child(2) {
          margin-left: 0.38em;

          color: #84ff1f;
        }

        /* ==========================================================
           COPY
        ========================================================== */

        .hero-copy {
          width: 370px;

          margin:
            30px 0 0;

          font-size: 14px;

          line-height: 1.65;

          color:
            rgba(255, 255, 255, 0.52);
        }

        /* ==========================================================
           CTA
        ========================================================== */

        .hero-button-wrap {
          margin-top: 27px;

          pointer-events: auto;
        }

        .hero-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 15px;

          min-height: 50px;

          padding:
            0 18px
            0 22px;

          border-radius: 999px;

          background: #84ff1f;

          color: #080908;

          text-decoration: none;

          font-size: 12px;
          font-weight: 700;

          transition:
            transform
              0.35s
              cubic-bezier(.2,.8,.2,1),

            box-shadow
              0.35s ease;
        }

        .hero-button svg {
          transition:
            transform
              0.35s
              cubic-bezier(.2,.8,.2,1);
        }

        .hero-button:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 14px 38px
            rgba(132, 255, 31, 0.15);
        }

        .hero-button:hover svg {
          transform:
            translateX(4px);
        }

        .hero-button:active {
          transform:
            translateY(-1px);
        }

        /* ==========================================================
           CONTROLLER / PS5 ART
        ========================================================== */

        .hero-controller {
          position: absolute;

          z-index: 6;

          width:
            min(
              790px,
              59vw
            );

          right: -4%;

          top: 52%;

          transform:
            translateY(-50%);

          pointer-events: none;

          will-change: transform;
        }

        .hero-controller img {
          display: block;

          width: 100%;
          height: auto;

          user-select: none;

          filter:
            drop-shadow(
              0 48px 70px
              rgba(0, 0, 0, 0.72)
            )
            drop-shadow(
              0 15px 28px
              rgba(0, 0, 0, 0.38)
            );
        }

        /* ==========================================================
           PRODUCT TAG
        ========================================================== */

        .hero-product-tag {
          position: absolute;

          right:
            clamp(
              65px,
              9vw,
              150px
            );

          top: 24%;

          z-index: 13;

          display: flex;
          flex-direction: column;

          gap: 5px;

          padding:
            12px 14px;

          border:
            1px solid
            rgba(255, 255, 255, 0.10);

          background:
            rgba(8, 9, 8, 0.62);

          backdrop-filter:
            blur(12px);

          -webkit-backdrop-filter:
            blur(12px);

          pointer-events: none;
        }

        .hero-product-tag small {
          font-size: 8px;

          letter-spacing:
            0.13em;

          text-transform:
            uppercase;

          color:
            rgba(255,255,255,0.34);
        }

        .hero-product-tag span {
          font-size: 11px;

          font-weight: 600;

          color:
            rgba(255,255,255,0.82);
        }

        /* ==========================================================
           BOTTOM RAIL
        ========================================================== */

        .hero-rail {
          position: absolute;

          left:
            clamp(
              24px,
              5vw,
              85px
            );

          right:
            clamp(
              24px,
              5vw,
              85px
            );

          bottom: 38px;

          z-index: 15;

          display: flex;

          align-items: center;
          justify-content: space-between;

          border-top:
            1px solid
            rgba(255,255,255,0.085);

          padding-top: 14px;
        }

        .hero-rail-left {
          display: flex;

          align-items: center;

          gap: 23px;

          font-size: 9px;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;

          color:
            rgba(255,255,255,0.25);
        }

        .hero-rail-left strong {
          color:
            rgba(255,255,255,0.72);

          font-weight: 600;
        }

        .hero-rail-right {
          display: flex;

          align-items: center;

          gap: 10px;

          font-size: 9px;

          letter-spacing:
            0.13em;

          text-transform:
            uppercase;

          color:
            rgba(255,255,255,0.25);
        }

        .hero-rail-arrow {
          width: 26px;
          height: 1px;

          background:
            rgba(255,255,255,0.17);
        }

        /* ==========================================================
           BOTTOM FADE
        ========================================================== */

        .hero-bottom-fade {
          position: absolute;

          left: 0;
          right: 0;
          bottom: 0;

          height: 170px;

          z-index: 9;

          pointer-events: none;

          background:
            linear-gradient(
              to bottom,
              transparent,
              #080908
            );
        }

        /* ==========================================================
           TABLET
        ========================================================== */

        @media (max-width: 1100px) {

          .hero-stage {
            padding-left: 40px;
            padding-right: 40px;
          }

          .hero-index {
            left: 40px;
          }

          .hero-content {
            left: 40px;
            width: 560px;
          }

          .hero-title {
            font-size:
              clamp(
                68px,
                8.6vw,
                108px
              );
          }

          .hero-controller {
            width: 690px;
            right: -11%;
          }

          .hero-product-tag {
            right: 45px;
          }

          .hero-rail {
            left: 40px;
            right: 40px;
          }
        }

        /* ==========================================================
           MOBILE
        ========================================================== */

        @media (max-width: 760px) {

          .hero-cinematic {
            height: 100svh;
            min-height: 820px;
          }

          .hero-stage {
            min-height: 820px;

            padding:
              100px
              22px
              80px;
          }

          .hero-index {
            left: 22px;
            top: 108px;
          }

          .hero-content {
            left: 22px;
            right: 22px;

            bottom: 145px;

            width: auto;
          }

          .hero-eyebrow {
            margin-bottom: 23px;
          }

          .hero-title {
            font-size:
              clamp(
                58px,
                15vw,
                96px
              );
          }

          .hero-title-line:nth-child(2) {
            margin-left: 0.27em;
          }

          .hero-copy {
            width: min(330px, 90%);

            margin-top: 26px;

            font-size: 13px;
          }

          .hero-button-wrap {
            margin-top: 24px;
          }

          .hero-button {
            min-height: 48px;

            padding:
              0 17px
              0 20px;
          }

          .hero-controller {
            width: 620px;

            right: -280px;

            top: 47%;
          }

          .hero-product-tag {
            display: none;
          }

          .hero-background-ring {
            width: 620px;
            height: 620px;

            right: -290px;
          }

          .hero-background-glow {
            width: 480px;
            height: 480px;

            right: -170px;

            top: 55%;
          }

          .hero-vignette {
            background:
              linear-gradient(
                to bottom,
                rgba(8,9,8,0.94),
                rgba(8,9,8,0.42) 35%,
                rgba(8,9,8,0.18) 55%,
                rgba(8,9,8,0.88) 100%
              );
          }

          .hero-rail {
            left: 22px;
            right: 22px;

            bottom: 28px;
          }

          .hero-rail-right {
            display: none;
          }

          .hero-rail-left {
            gap: 16px;
          }

        }

        /* ==========================================================
           SMALL MOBILE
        ========================================================== */

        @media (max-width: 520px) {

          .hero-cinematic {
            min-height: 760px;
          }

          .hero-stage {
            min-height: 760px;

            padding:
              95px
              20px
              65px;
          }

          .hero-index {
            left: 20px;
            top: 96px;
          }

          .hero-content {
            left: 20px;
            right: 20px;

            bottom: 120px;
          }

          .hero-eyebrow {
            margin-bottom: 20px;

            font-size: 9px;

            letter-spacing:
              0.16em;
          }

          .hero-title {
            font-size: 55px;

            letter-spacing:
              -0.07em;
          }

          .hero-copy {
            max-width: 290px;

            margin-top: 22px;

            font-size: 12px;
          }

          .hero-button-wrap {
            margin-top: 22px;
          }

          .hero-button {
            min-height: 46px;

            font-size: 11px;
          }

          .hero-controller {
            width: 540px;

            right: -250px;

            top: 45%;
          }

          .hero-background-ring {
            width: 500px;
            height: 500px;

            right: -260px;
          }

          .hero-rail {
            left: 20px;
            right: 20px;

            bottom: 22px;
          }

          .hero-rail-left {
            font-size: 8px;
            gap: 13px;
          }

        }

        /* ==========================================================
           REDUCED MOTION
        ========================================================== */

        @media (prefers-reduced-motion: reduce) {

          .hero-button,
          .hero-button svg {
            transition: none;
          }

        }

      `}</style>

      <section
        ref={heroRef}
        className="hero-cinematic"
        aria-label="Gamers End featured collection"
      >

        {/* BACKGROUND */}

        <div className="hero-grid" />

        <div className="hero-background-ring" />

        <div className="hero-background-glow" />

        <div className="hero-vignette" />


        <div className="hero-stage">




          {/* ======================================================
              CONTROLLER / PS5
          ====================================================== */}

          <div
            ref={controllerRef}
            className="hero-controller"
          >

            <img
              src="/images/Playstation-with-controller.png"
              alt="Gaming Controller"
              draggable={false}
            />

          </div>


          {/* ======================================================
              PRODUCT LABEL
          ====================================================== */}

          <div className="hero-product-tag">

            <small>
              Featured Hardware
            </small>

            <span>
              Performance Controllers
            </span>

          </div>


          {/* ======================================================
              MAIN CONTENT
          ====================================================== */}

          <div
            ref={contentRef}
            className="hero-content"
          >

            <p className="hero-eyebrow">
              Explore The Ecosystem
            </p>


            <h1 className="hero-title">

              <span className="hero-title-line">
                The Rise
              </span>

              <span className="hero-title-line">
                Of Gaming
              </span>

            </h1>


            <p className="hero-copy">
              Discover specialized controllers built
              around precision, speed and complete
              control.
            </p>


            <div className="hero-button-wrap">

              <Link
                to="/shop?category=controllers"
                className="hero-button"
              >

                <span>
                  Shop The Collection
                </span>

                <ArrowRight
                  size={15}
                  strokeWidth={2}
                />

              </Link>

            </div>

          </div>


          {/* ======================================================
              BOTTOM RAIL
          ====================================================== */}

          <div className="hero-rail">

            <div className="hero-rail-left">

              <strong>
                Controllers
              </strong>

              <span>
                Gaming Hardware
              </span>

              <span>
                2026 Collection
              </span>

            </div>


            <div className="hero-rail-right">

              <span>
                Scroll To Explore
              </span>

              <span className="hero-rail-arrow" />

              <span>
                ↓
              </span>

            </div>

          </div>

        </div>


        {/* BOTTOM FADE */}

        <div className="hero-bottom-fade" />

      </section>
    </>
  );
}

export { Hero };