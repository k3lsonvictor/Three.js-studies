/* eslint-disable react/no-unknown-property */
import { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BlendFunction } from "postprocessing";
import Rifle from "./Rifle";

gsap.registerPlugin(ScrollTrigger);

function AnimatedCamera() {
  const cameraRef = useRef(null);

  useLayoutEffect(() => {
    const camera = cameraRef.current;

    if (!camera) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".scroll-scenes",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
        })
        .to(camera, {
          fov: 28,
          ease: "none",
          onUpdate: () => camera.updateProjectionMatrix(),
        })
        .to(camera, {
          fov: 52,
          ease: "none",
          onUpdate: () => camera.updateProjectionMatrix(),
        })
        .to(camera, {
          fov: 38,
          ease: "none",
          onUpdate: () => camera.updateProjectionMatrix(),
        });
    });

    return () => context.revert();
  }, []);

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0.25, 5.3]}
      fov={38}
    />
  );
}

function Scene() {
  return (
    <div className="model-stage" aria-hidden="true">
      <Canvas dpr={[1, 2]}>
        <AnimatedCamera />
        <OrbitControls
          enableDamping
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.1}
        />
        <color attach="background" args={["#151515"]} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 5, 5]} intensity={3.5} />
        <directionalLight position={[-4, -2, 3]} intensity={1.8} color="#ff7050" />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <Rifle />
          </Bounds>
          <Environment preset="city" />
        </Suspense>
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom
            intensity={0.18}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.45}
            mipmapBlur
            radius={0.28}
          />
          <Vignette eskil={false} offset={0.32} darkness={1} />
          <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.025} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default Scene;
