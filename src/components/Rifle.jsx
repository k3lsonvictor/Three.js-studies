/* eslint-disable react/no-unknown-property */
import { useEffect, useLayoutEffect, useRef } from "react";
import { Center, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MODEL_PATH = "/Meshy_AI_Crimson_Cogwork_Rifle_0629221108_texture.glb";

function Rifle({ onReady }) {
  const groupRef = useRef(null);
  const { scene } = useGLTF(MODEL_PATH);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useLayoutEffect(() => {
    const group = groupRef.current;

    if (!group) {
      return undefined;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".scroll-scenes",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      timeline
        .set(group.position, { x: 0, y: -0.25, z: 0 })
        .set(group.rotation, { x: 0.12, y: -0.45, z: 0.08 })
        .to(group.position, { x: -1.7, y: 0.05, z: 0.15, ease: "none" })
        .to(
          group.rotation,
          { x: 0.55, y: Math.PI * 1.25, z: -0.12, ease: "none" },
          "<",
        )
        .to(group.position, { x: 1.6, y: -0.12, z: -0.1, ease: "none" })
        .to(
          group.rotation,
          { x: -0.18, y: Math.PI * 2.2, z: 0.22, ease: "none" },
          "<",
        )
        .to(group.position, { x: -0.35, y: 0.18, z: 0.25, ease: "none" })
        .to(
          group.rotation,
          { x: 0.22, y: Math.PI * 3.25, z: -0.1, ease: "none" },
          "<",
        );
    });

    return () => context.revert();
  }, []);

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={1.35} />
      </Center>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

export default Rifle;
