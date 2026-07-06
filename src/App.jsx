import { useCallback, useEffect, useRef, useState } from "react";
import Crosshair from "./components/Crosshair";
import GradualBlur from "./components/GradualBlur";
import Plasma from "./components/Plasma";
import Scene from "./components/Scene";
import TrueFocus from "./components/TrueFocus";
import "./App.css";
import { Cog } from "lucide-react";
import { Shield } from "lucide-react";
import { Sparkles } from "lucide-react";

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

export function WeaponInfoCard() {
  return (
    <div className="w-fit rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-5">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/20">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
              Raridade
            </p>
            <p className="text-lg font-bold text-amber-300">
              Lendária
            </p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 border border-red-400/20">
            <Shield className="h-5 w-5 text-red-400" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
              Coleção
            </p>
            <p className="text-base font-semibold text-white">
              Forjas Esquecidas
            </p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/20">
            <Cog className="h-5 w-5 text-cyan-400" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
              Tema
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {[
                "Industrial",
                "Steampunk",
                "Mecânico",
                "Retrô-futurista",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 backdrop-blur"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const scrollScenesRef = useRef(null);
  const chapter3Ref = useRef(null);
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
        chapter3Ref={chapter3Ref}
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
        ref={chapter3Ref}
      >
        <p className="w-[50%] border-0 border-red-700"></p>
        <div className="section-content">
          {/* <span className="eyebrow">Capítulo 01</span> */}
          <span className="eyebrow mb-3 !text-sm uppercase tracking-[.45em] text-red-500">
            Capítulo 01
          </span>
          <h2 className="eyebrow w-[100%] text-start mb-5 text-6xl font-black uppercase tracking-wide !text-white">
            Engrenagem
            <br />
            Rubra
          </h2>
          <p className="panel-copy text-white pr-28 text-xl !font-thin">
            Um rifle conceitual de oficina, construido em camadas de metal
            escurecido, cobre gasto e pecas aparentes que sugerem montagem
            manual.
          </p>
        </div>
      </section>

      <section
        className="panel relative flex min-h-screen items-start justify-evenly"
        id="chapter-3"
      >
        <div className="section-content !items-start">
          <span className="mb-3 text-sm uppercase tracking-[.45em] text-red-500">
            Capítulo 02
          </span>
          <h2 className="mb-5 text-6xl font-black uppercase tracking-wide text-white">
            Engrenagem
            <br />
            Rubra
          </h2>
          <p className="panel-copy text-white !w-[40%] text-center pr-28 text-xl !font-semibold">
            A silhueta alongada destaca o cano, a coronha e o corpo mecanico,
            enquanto os detalhes vermelhos dao ao modelo uma identidade
            industrial mais agressiva.
          </p>
          <p className="panel-copy text-white !w-[40%] text-center pr-28 text-xl !font-thin">
            Forjada onde aço e maquinaria se encontram, Engrenagem Rubra é um acabamento que transforma uma arma comum em uma verdadeira relíquia de guerra industrial. Seu corpo exibe metal escurecido e desgastado, marcado por anos de combate, enquanto detalhes em cobre oxidado e anéis de energia vermelha percorrem toda a estrutura, sugerindo um mecanismo alimentado por uma tecnologia esquecida.
          </p>
          <p className="panel-copy text-white !w-[40%] text-center pr-28 text-xl !font-thin mb-10">
            O enorme tambor lateral de engrenagens expostas gira em perfeita sincronia a cada disparo, liberando faíscas e um brilho rubro entre os dentes metálicos. O cano reforçado apresenta gravações mecânicas e placas rebitadas, combinando um visual brutalista com elementos steampunk. A luneta integrada completa o conjunto, oferecendo uma aparência tática sem perder a identidade industrial da arma.          </p>

          <WeaponInfoCard />
          {/* <div>
            <p>Raridade: Lendária</p>
            <p>Coleção: Forjas Esquecidas</p>
            <p>Tema: Industrial • Steampunk • Mecânico • Retrô-futurista</p>
          </div> */}

        </div>
        {/* <p className="w-[50%] order-2"></p> */}
        <div className="absolute flex w-[100%] justify-start !items-start
          top-[50%] left-[50%] -translate-x-[10%] -translate-y-[80%] z-10
        ">
          <img className="w-[50%] order-2" src="/section3.png" alt="Rifle Image" />
        </div>
      </section>

      <section
        className="panel chapter-four-panel relative flex min-h-screen items-center overflow-hidden px-24"
        id="chapter-4"
      >
        <img
          className="chapter-four-background absolute inset-0 h-full w-full object-cover"
          src="/background-batle.jpg"
          alt=""
          aria-hidden="true"
        />

        <div className="chapter-four-background-tint absolute inset-0 bg-black/75" />

        {/* Glow atrás da arma */}
        <div className="absolute left-[24%] top-1/2 h-[650px] w-[650px] -translate-y-1/2 rounded-full bg-red-600/10 blur-[180px]" />

        <GradualBlur
          className="chapter-four-transition-blur"
          position="center"
          height="16rem"
          strength={4}
          divCount={12}
          curve="bezier"
          exponential
          opacity={1}
          target="parent"
          zIndex={1}
        />

        {/* ARMA */}
        <div className="relative z-20 flex w-1/2 items-center justify-center">
          {/* <img
            src="/weapon.png"
            alt="Engrenagem Rubra"
            className="w-[95%] drop-shadow-[0_60px_50px_rgba(0,0,0,.8)] transition duration-500 hover:scale-105"
          /> */}
        </div>

        {/* TEXTO */}
        <div className="relative z-20 flex w-[480px] flex-col">

          {/* Número enorme */}
          <span className="absolute -top-28 right-0 text-[220px] font-black leading-none text-white/[0.03]">
            03
          </span>

          <span className="mb-3 text-sm uppercase tracking-[.45em] text-red-500">
            Capítulo 03
          </span>

          <h2 className="mb-5 text-6xl font-black uppercase tracking-wide text-white">
            Engrenagem
            <br />
            Rubra
          </h2>

          <p className="mb-10 text-lg font-light leading-8 text-zinc-300">
            Desenvolvida para cenas cinematográficas em tempo real, a
            <span className="text-red-400"> Engrenagem Rubra </span>
            combina aço envelhecido, mecanismos aparentes e iluminação emissiva,
            criando uma estética industrial inspirada no steampunk.
          </p>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.25em] text-zinc-500">
                  Raridade
                </p>

                <p className="mt-1 text-xl font-bold text-yellow-400">
                  ★ Lendária
                </p>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div>
                <p className="text-xs uppercase tracking-[.25em] text-zinc-500">
                  Coleção
                </p>

                <p className="mt-1 font-medium text-white">
                  Forjas Esquecidas
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-3 text-xs uppercase tracking-[.25em] text-zinc-500">
                Tema
              </p>

              <div className="flex flex-wrap gap-2">

                {[
                  "Industrial",
                  "Steampunk",
                  "Mecânico",
                  "Retrô-futurista",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}

            <div className="space-y-4">

              {[
                ["Poder", 92],
                ["Precisão", 84],
                ["Alcance", 90],
                ["Controle", 71],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400"
                      style={{ width: `${value}%` }}
                    />

                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>
      </section>
    </main>
  );
}

export default App;
