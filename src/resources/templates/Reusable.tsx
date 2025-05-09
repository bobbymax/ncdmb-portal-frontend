import React from "react";
import CompanyLogo from "resources/views/components/pages/CompanyLogo";
import SpaceMenu from "resources/views/components/partials/SpaceMenu";

const Reusable = () => {
  return (
    <header id="portal-header">
      {/* <div id="menu-container">
        <div className="avatar"></div>
      </div>
      <div id="navigation-wrapper">
        <div className="menu-links">
          <Link
            to={dashboard}
            className={`nav-link-item ${
              dashboard === activePath ? "active" : ""
            }`}
            title="Dashboard"
          >
            <i className="ri-dashboard-line" />
            <span className="tooltip">Dashboard</span>
          </Link>
          {navigation.map((nav, i) => (
            <Link
              key={i}
              to={nav.path}
              className={`nav-link-item ${
                nav.path === activePath ? "active" : ""
              }`}
              title={nav.name}
            >
              <span className="tooltip">{nav.name}</span>
              <i className={nav.icon} />
            </Link>
          ))}
        </div>
      </div>
      <div id="logout-nav" onClick={handleLogout}>
        <i className="ri-logout-circle-line" />
      </div> */}
      <div className="portal-header__inner">
        <div id="company-logo" className="flex align gap-md">
          <CompanyLogo color="primary" text />
          {/* Handle Dropdown Here */}
          {/* Applications Menu */}
          <nav className="applications">
            {/* <SpaceMenu
              apps={apps}
              toggleNav={toggleNav}
              dropDownState={dropdownState}
            /> */}
          </nav>
        </div>
        <div id="profile-area">
          <div className="app-dropdown">
            <i className="ri-apps-line" />
          </div>
          <i className="ri-notification-2-line" />
          <i className="ri-mail-line" />
          <div className="profile-area__inner">
            {/* <h2>{staff?.name}</h2>
            <small>{staff?.role?.name}</small> */}
          </div>
        </div>
      </div>
    </header>
  );

  //   {
  //     dropdownState === "open" && (
  //       <section className="dropdown__menu__custom bounce-in">
  //         <div className="menu__items">
  //           <div className="row">
  //             {apps.map((item, i) => (
  //               <div className="col-md-4 mb-5" key={i}>
  //                 <Link to={item.path} className="menu__link flex align gap-md">
  //                   <img
  //                     src={item.image_path}
  //                     style={{
  //                       filter:
  //                         item.path === activePage
  //                           ? "grayscale(0%)"
  //                           : "grayscale(100%)",
  //                     }}
  //                     alt="App Logo"
  //                   />
  //                   <span>{item.name}</span>
  //                 </Link>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //         <div className="menu__description__section"></div>
  //       </section>
  //     );
  //   };
};

export default Reusable;
