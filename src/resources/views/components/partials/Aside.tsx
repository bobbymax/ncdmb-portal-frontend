import { AuthPageResponseData } from "app/Repositories/Page/data";
import { Link } from "react-router-dom";
import CompanyLogo from "../pages/CompanyLogo";
import { useCallback, useMemo } from "react";
import NewBrandLogo from "../pages/NewBrandLogo";
import AlternateLogo from "../pages/AlternateLogo";

interface SidebarProps {
  navigation: AuthPageResponseData[];
  dashboard: string;
  activePath: string;
  handleLogout: () => void;
}

interface NavigationItem extends AuthPageResponseData {
  children?: NavigationItem[];
}

const Aside = ({
  dashboard,
  navigation,
  handleLogout,
  activePath,
}: SidebarProps) => {
  // console.log(navigation);

  const groupNavigation = (nav: NavigationItem[]): NavigationItem[] => {
    const map = new Map<
      number,
      NavigationItem & { children: NavigationItem[] }
    >();

    const roots: (NavigationItem & {
      children: NavigationItem[];
    })[] = [];

    for (const item of nav) {
      map.set(item.id, { ...item, children: [] });
    }

    for (const item of nav) {
      const current = map.get(item.id)!;

      if (item.parent_id) {
        const parent = map.get(item.parent_id);

        if (parent) {
          parent.children.push(current);
        }
      } else {
        roots.push(current);
      }
    }

    // console.log(roots);

    return roots;
  };

  const renderNavigation = (
    items: NavigationItem[],
    activePath: string
  ): JSX.Element[] => {
    return items.map((nav) => {
      const hasChildren = nav.children && nav.children.length > 0;
      const isActive = nav.path === activePath;

      return (
        <div className="new__nav__item" key={nav.id}>
          {hasChildren ? (
            <>
              <div
                className={`parent__nav flex align between ${
                  isActive ? "active" : ""
                }`}
              >
                <div className="smaller__detais flex align gap-md">
                  <i className={nav.icon} />
                  <p>{nav.name}</p>
                </div>

                {/* <i className="ri-arrow-down-s-line" /> */}
              </div>

              <div className="new__dropdown__menu__section">
                {renderNavigation(nav.children ?? [], activePath)}
              </div>
            </>
          ) : (
            <Link
              to={nav.path}
              className={`child__nav__link ${isActive ? "active" : ""}`}
            >
              <div className="smaller__detais flex align gap-md">
                <i className={nav.icon} />
                <p>{nav.name}</p>
              </div>
            </Link>
          )}
        </div>
      );
    });
  };

  const links = useMemo(() => {
    if (!Array.isArray(navigation) || navigation.length === 0) {
      return <p>Nav empty</p>;
    }

    const grouped = groupNavigation(navigation);

    return renderNavigation(grouped, activePath);
  }, [navigation, activePath]);

  return (
    <aside id="sidebar-wrapper">
      <div className="sidebar-box">
        {/* Logo Section */}
        {/* <CompanyLogo color="primary" text /> */}
        <div className="brand-name">
          {/* <NewBrandLogo /> */}
          <AlternateLogo />
        </div>
        {/* End Logo Section */}
        <div className="mb-4"></div>
        {/* Navigation Section */}
        <div className="new__nav__container">{links}</div>
        {/* End Naviagtion Section */}
      </div>
    </aside>
  );
};

export default Aside;
