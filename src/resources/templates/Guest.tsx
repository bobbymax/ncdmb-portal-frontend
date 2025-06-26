import { ProtectedProps } from "./Protected";
import { tsParticles } from "@tsparticles/engine";
import { loadAll } from "@tsparticles/all";
import { useEffect } from "react";

const Guest = ({ children }: ProtectedProps) => {
  useEffect(() => {
    loadAll(tsParticles);
  }, []);
  return <div className="login-form">{children}</div>;
};

export default Guest;
