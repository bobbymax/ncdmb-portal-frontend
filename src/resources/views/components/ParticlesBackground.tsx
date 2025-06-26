import React from "react";
import { Particles } from "@tsparticles/react";
import type { Container } from "@tsparticles/engine";

const ParticlesBackground: React.FC = () => {
  return (
    <Particles
      id="tsparticles"
      options={{
        background: {
          color: { value: "transparent" },
        },
        fpsLimit: 60,
        detectRetina: true,
        particles: {
          number: {
            value: 50,
            density: {
              enable: true,
              width: 800,
            },
          },
          color: { value: "#ffffff" },
          shape: {
            type: "circle",
            options: {},
          },
          stroke: {
            width: 0,
            color: "#000",
          },
          opacity: {
            value: 0.3,
            animation: {
              enable: true,
              speed: 0.5,
              sync: false,
            },
          },
          size: { value: { min: 1, max: 3 } },
          links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.2,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            outModes: { default: "out" },
            attract: {
              rotate: {
                x: 100,
                y: 300,
              },
            },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: {
              enable: true,
              delay: 0,
            },
          },
          modes: {
            grab: {
              distance: 300,
              duration: 0.4,
            },
          },
        },
      }}
    />
  );
};

export default ParticlesBackground;
