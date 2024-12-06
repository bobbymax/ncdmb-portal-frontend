import { AuthPageResponseData } from "app/Repositories/Page/data";
import { Link } from "react-router-dom";

interface MenuItemProp {
  item: AuthPageResponseData;
  count: number;
  position: number;
  isOpen: boolean;
  transitionDelay: number;
  rotation: number;
}

const CircularMenuItem = ({
  item,
  count,
  position,
  isOpen,
  transitionDelay,
  rotation,
}: MenuItemProp) => {
  return (
    <Link
      to={item.path}
      className="menu-item"
      style={{
        transform: `rotate(${rotation}deg) translate(${isOpen ? 135 : 0}%)`,
        transitionDelay: `${isOpen ? transitionDelay : 0}ms`,
      }}
      title={item.name}
    >
      <i
        style={{
          transform: `rotate(${-rotation}deg)`,
        }}
        className={item.icon}
      />
    </Link>
  );
};

export default CircularMenuItem;
