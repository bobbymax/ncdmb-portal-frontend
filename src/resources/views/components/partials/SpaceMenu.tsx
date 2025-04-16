import { AuthPageResponseData } from "app/Repositories/Page/data";
import { useEffect, useRef, useState } from "react";

const SpaceMenu = ({
  apps = [],
  toggleNav,
  dropDownState = "closed",
}: {
  apps: AuthPageResponseData[];
  toggleNav: () => void;
  dropDownState: "open" | "closed" | "closing";
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-dropdown" ref={dropdownRef}>
      <div
        className={`space-button ${dropDownState === "open" ? "active" : ""}`}
        onClick={toggleNav}
      >
        <div className="details flex align gap-sm">
          <i className="ri-apps-line" />
          <h3>Applications</h3>
        </div>
        {/* {open && (
          <ul className="dropdown__menu__custom">
            {apps.map((item, i) => (
              <li key={i}>{item.name}</li>
            ))}
          </ul>
        )} */}
      </div>
    </div>
  );
};

export default SpaceMenu;
