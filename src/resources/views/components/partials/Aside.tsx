import { AuthPageResponseData } from "app/Repositories/Page/data";
import { Link } from "react-router-dom";
import CompanyLogo from "../pages/CompanyLogo";
import { useCallback, useMemo, useState, useEffect } from "react";
import NewBrandLogo from "../pages/NewBrandLogo";
import AlternateLogo from "../pages/AlternateLogo";
import TextInput from "../forms/TextInput";
import ThemeToggle from "../ThemeToggle";

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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const closeMobileSidebar = () => {
    const sidebar = document.getElementById("sidebar-wrapper");
    if (sidebar) {
      sidebar.classList.remove("sidebar-open");
    }
  };

  const toggleExpanded = (itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        // If already expanded, collapse it
        newSet.delete(itemId);
      } else {
        // Clear all other expanded items and expand this one
        newSet.clear();
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Auto-expand items that contain the active path
  useEffect(() => {
    const findActiveParent = (items: NavigationItem[]): number | null => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          // Check if any child matches the active path
          const hasActiveChild = item.children.some(
            (child) =>
              child.path === activePath ||
              (child.children && findActiveParent(child.children))
          );
          if (hasActiveChild) {
            return item.id;
          }
        }
      }
      return null;
    };

    const activeParentId = findActiveParent(navigation);
    if (activeParentId) {
      setExpandedItems(new Set([activeParentId]));
    }
  }, [activePath, navigation]);

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
      const isExpanded = expandedItems.has(nav.id);

      return (
        <div className="new__nav__item" key={nav.id}>
          {hasChildren ? (
            <>
              <div
                className={`parent__nav flex align ${isActive ? "active" : ""}`}
                onClick={() => toggleExpanded(nav.id)}
                data-tooltip={nav.name}
              >
                <div className="smaller__detais flex align gap-md">
                  <i className={nav.icon} />
                  <p>{nav.name}</p>
                </div>
              </div>

              <div
                className={`new__dropdown__menu__section transition-all duration-200 ${
                  isExpanded ? "block" : "hidden"
                }`}
              >
                {renderNavigation(nav.children ?? [], activePath)}
              </div>
            </>
          ) : (
            <Link
              to={nav.path}
              className={`child__nav__link ${isActive ? "active" : ""}`}
              data-tooltip={nav.name}
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
        <div className="brand-name">
          <AlternateLogo />
        </div>

        {/* Search Section */}
        <div className="mb-4">
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
          <div className="nav-content">
            {/* Dashboard Section */}
            <div className="new__nav__item">
              <div className={`parent__nav flex align`}>
                <div className="smaller__detais flex align gap-md">
                  <i className="ri-dashboard-line" />
                  <p>Dashboard</p>
                </div>
              </div>

              <div className="new__dropdown__menu__section">
                <Link
                  to="/insights"
                  className={`child__nav__link ${
                    activePath === "/insights" ? "active" : ""
                  }`}
                >
                  <div className="smaller__detais flex align gap-md">
                    <i className="ri-bar-chart-line" />
                    <p>Insights</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Main Navigation */}
            {links}
          </div>

          {/* Theme Toggle */}
          <div className="theme-toggle-section">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
