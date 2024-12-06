import { useState } from "react";
import CircularMenuItem from "./CircularMenuItem";
import { AuthPageResponseData } from "app/Repositories/Page/data";

interface MenuList {
  lists: AuthPageResponseData[];
}

const CircularMenu = ({ lists }: MenuList) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="circular-menu">
      <div
        className="menu-bttn"
        onClick={() => setIsOpen((prevState) => !prevState)}
      >
        {isOpen ? (
          <i className="ri-close-large-line" />
        ) : (
          <i className="ri-add-large-line" />
        )}
      </div>
      {lists.map((nav, i) => (
        <CircularMenuItem
          key={i}
          item={nav}
          count={lists.length}
          position={i}
          isOpen={isOpen}
          transitionDelay={i * 85}
          rotation={(360 / lists.length) * i}
        />
      ))}
    </div>
  );
};

export default CircularMenu;
