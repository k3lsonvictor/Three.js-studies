import { useCallback, useEffect, useRef, useState } from "react";
import Crosshair from "./components/Crosshair";
import Plasma from "./components/Plasma";
import Scene from "./components/Scene";
import TrueFocus from "./components/TrueFocus";
import "./App.css";

const chapters = [
  "Apresentacao",
  "Estrutura",
  "Acabamento",
  "Detalhes",
];

function getPerformanceProfile() {
  if (typeof window === "undefined") {
    return "full";
  }

  const isNarrowScreen = window.matchMedia("(max-width: 1024px)").matches;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lowCoreCount =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= 4;
  const lowMemory =
    typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;

  return isNarrowScreen || prefersReducedMotion || lowCoreCount || lowMemory
    ? "lite"
    : "full";
}

function usePerformanceProfile() {
  const [profile, setProfile] = useState(getPerformanceProfile);

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(max-width: 1024px)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];
    const updateProfile = () => {
      setProfile(getPerformanceProfile());
    };

    mediaQueries.forEach((query) => {
      query.addEventListener("change", updateProfile);
    });

    updateProfile();

    return () => {
      mediaQueries.forEach((query) => {
        query.removeEventListener("change", updateProfile);
      });
    };
  }, []);

  return profile;
}

function ChapterProgress() {
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const updateChapter = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      const nextChapter = Math.min(
        chapters.length - 1,
        Math.round(progress * (chapters.length - 1)),
      );

      setActiveChapter(nextChapter);
    };

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateChapter);
    };

    updateChapter();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <nav className="chapter-progress" aria-label="Progresso dos capitulos">
      <div className="chapter-track" aria-hidden="true" />
      {chapters.map((chapter, index) => (
        <a
          className={`chapter-dot ${index === activeChapter ? "is-active" : ""}`}
          href={`#chapter-${index + 1}`}
          key={chapter}
          aria-label={`Ir para ${chapter}`}
          aria-current={index === activeChapter ? "step" : undefined}
        >
          <span className="chapter-dot-marker" />
          <span className="chapter-dot-label">{chapter}</span>
        </a>
      ))}
    </nav>
  );
}

function App() {
  const scrollScenesRef = useRef(null);
  const [modelReady, setModelReady] = useState(false);
  const performanceProfile = usePerformanceProfile();
  const isLite = performanceProfile === "lite";
  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  return (
    <main
      className={`scroll-scenes overflow-x-hidden performance-${performanceProfile}`}
      ref={scrollScenesRef}
    >
      {modelReady && !isLite ? (
        <div className="plasma-backdrop is-visible" aria-hidden="true">
          <Plasma
            color="#735D7A"
            speed={0.45}
            direction="pingpong"
            scale={1}
            opacity={0.28}
            mouseInteractive={false}
          />
        </div>
      ) : null}
      <Scene
        onModelReady={handleModelReady}
        performanceProfile={performanceProfile}
      />
      {!isLite ? (
        <Crosshair
          color="#ff705050"
          containerRef={scrollScenesRef}
        />
      ) : null}
      <ChapterProgress />
      <div
        className={`model-loader ${modelReady ? "is-hidden" : ""}`}
        aria-live="polite"
      >
        Carregando modelo
      </div>

      <section
        className="panel hero-panel relative grid min-h-screen place-items-center"
        id="chapter-1"
      >
        <div className="hero-title top-title hero-focus">
          <TrueFocus
            sentence="Concept Rifle"
            blurAmount={isLite ? 2 : 4}
            borderColor="#ff7050"
            glowColor="rgba(255, 112, 80, 0.62)"
            animationDuration={isLite ? 0.85 : 0.65}
            pauseBetweenAnimations={isLite ? 1.4 : 0.9}
          />
        </div>
        {/* <p className="hero-title bottom-title">Concept Rifle</p> */}
      </section>

      <section
        className="panel relative flex min-h-screen items-center justify-evenly"
        id="chapter-2"
      >
        <p className="w-[50%] border-0 border-red-700"></p>
        <div className="section-content">
          <span className="eyebrow">Capítulo 01</span>
          <p className="panel-copy text-white pr-28 text-xl !font-thin">
            Um rifle conceitual de oficina, construido em camadas de metal
            escurecido, cobre gasto e pecas aparentes que sugerem montagem
            manual.
          </p>
        </div>
      </section>

      <section
        className="panel relative flex min-h-screen items-center justify-evenly"
        id="chapter-3"
      >
        <div className="section-content !items-start">
          <span className="eyebrow">Capítulo 02</span>
          <p className="panel-copy text-white order-1 w-[50%] text-center pr-28 text-xl !font-thin">
            A silhueta alongada destaca o cano, a coronha e o corpo mecanico,
            enquanto os detalhes vermelhos dao ao modelo uma identidade
            industrial mais agressiva.
          </p>
        </div>
        <p className="w-[50%] order-2"></p>
      </section>

      <section
        className="panel relative flex min-h-screen items-center justify-evenly"
        id="chapter-4"
      >
        <p className="w-[50%] border-0 border-red-700">
        </p>
        <div className="section-content">
          <span className="eyebrow">Capítulo 03</span>

          <p className="panel-copy text-white pr-28 text-lg !font-thin">
            Feito para close-ups em tempo real, o asset combina materiais
            envelhecidos, volumes robustos e leitura clara de perfil em uma cena
            3D interativa.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
