import { AuthPageResponseData } from "app/Repositories/Page/data";
import { Link } from "react-router-dom";
import CompanyLogo from "../pages/CompanyLogo";
import { useCallback, useMemo, useState } from "react";
import NewBrandLogo from "../pages/NewBrandLogo";
import AlternateLogo from "../pages/AlternateLogo";
import TextInput from "../forms/TextInput";

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
  const [searchTerm, setSearchTerm] = useState("");

  const closeMobileSidebar = () => {
    const sidebar = document.getElementById("sidebar-wrapper");
    if (sidebar) {
      sidebar.classList.remove("sidebar-open");
    }
  };

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

    return roots;
  };

  // Filter navigation based on search term
  const filterNavigation = (
    items: NavigationItem[],
    search: string
  ): NavigationItem[] => {
    if (!search.trim()) return items;

    const filtered: NavigationItem[] = [];

    for (const item of items) {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        const filteredChildren = filterNavigation(item.children || [], search);
        if (matchesSearch || filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren,
          });
        }
      } else if (matchesSearch) {
        filtered.push(item);
      }
    }

    return filtered;
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
    const filtered = filterNavigation(grouped, searchTerm);

    if (searchTerm.trim() && filtered.length === 0) {
      return (
        <div className="no-search-results">
          <p>No navigation items found for &quot;{searchTerm}&quot;</p>
        </div>
      );
    }

    return renderNavigation(filtered, activePath);
  }, [navigation, activePath, searchTerm]);

  return (
    <aside id="sidebar-wrapper">
      <div className="sidebar-box">
        {/* Mobile Close Button */}
        <button
          className="sidebar-close-btn"
          onClick={closeMobileSidebar}
          aria-label="Close sidebar"
        >
          <i className="ri-close-line" />
        </button>

        {/* Logo Section */}
        {/* <CompanyLogo color="primary" text /> */}
        <div className="brand-name">
          {/* <NewBrandLogo /> */}
          <AlternateLogo />
        </div>
        {/* End Logo Section */}
        <div className="mb-4"></div>
        <div className="mb-4">
          {/* Search Bar */}
          <TextInput
            type="text"
            placeholder="Search navigation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
            width={100}
          />
        </div>
        {/* Navigation Section */}
        <div className="new__nav__container">
          <div className="new__nav__item">
            <div className={`parent__nav flex align between`}>
              <div className="smaller__detais flex align gap-md">
                <i className="ri-dashboard-line" />
                <p>Insights</p>
              </div>

              {/* <i className="ri-arrow-down-s-line" /> */}
            </div>

            <div className="new__dropdown__menu__section">
              <Link
                to="/dashboard"
                className={`child__nav__link ${
                  activePath === "/dashboard" ? "active" : ""
                }`}
              >
                <div className="smaller__detais flex align gap-md">
                  <i className="ri-bank-line" />
                  <p>Dashboard</p>
                </div>
              </Link>
            </div>
          </div>
          {links}
        </div>
        {/* End Naviagtion Section */}
      </div>
    </aside>
  );
};

export default Aside;
