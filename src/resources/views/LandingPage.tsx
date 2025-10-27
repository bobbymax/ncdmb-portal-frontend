import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/landing-page.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const features = [
    {
      icon: "bi-file-earmark-text",
      title: "Document Management",
      description:
        "Comprehensive lifecycle management for all organizational documents with advanced tracking and versioning.",
      color: "#10b981",
    },
    {
      icon: "bi-diagram-3",
      title: "Workflow Automation",
      description:
        "Intelligent workflow automation with approval chains, notifications, and real-time status tracking.",
      color: "#3b82f6",
    },
    {
      icon: "bi-robot",
      title: "AI-Powered Analysis",
      description:
        "Advanced AI integration for document analysis, fraud detection, and intelligent recommendations.",
      color: "#8b5cf6",
    },
    {
      icon: "bi-shield-check",
      title: "Enterprise Security",
      description:
        "Bank-level encryption, role-based access control, and comprehensive audit trails for compliance.",
      color: "#f59e0b",
    },
    {
      icon: "bi-people",
      title: "Collaboration Hub",
      description:
        "Seamless team collaboration with real-time messaging, file sharing, and activity streams.",
      color: "#ec4899",
    },
    {
      icon: "bi-graph-up-arrow",
      title: "Analytics & Insights",
      description:
        "Powerful analytics dashboard with real-time metrics, performance tracking, and custom reports.",
      color: "#14b8a6",
    },
  ];

  const services = [
    {
      icon: "bi-wallet2",
      title: "Budget Management",
      description: "Comprehensive budget planning, tracking, and reporting",
    },
    {
      icon: "bi-box-seam",
      title: "Inventory Control",
      description: "Real-time inventory tracking and management system",
    },
    {
      icon: "bi-truck",
      title: "Logistics",
      description: "Streamlined logistics and supply chain management",
    },
    {
      icon: "bi-headset",
      title: "Helpdesk",
      description: "24/7 support ticketing and resolution system",
    },
    {
      icon: "bi-calendar-event",
      title: "Meetings",
      description: "Intelligent meeting scheduling and management",
    },
    {
      icon: "bi-car-front",
      title: "Vehicle Management",
      description: "Fleet tracking and maintenance scheduling",
    },
  ];

  const stats = [
    { value: "50+", label: "Business Entities", icon: "bi-diagram-2" },
    { value: "99.9%", label: "Uptime", icon: "bi-speedometer2" },
    { value: "<50ms", label: "Performance", icon: "bi-lightning" },
    { value: "Enterprise", label: "Security", icon: "bi-shield-lock" },
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav
        className={`landing-nav ${scrollY > 50 ? "landing-nav-scrolled" : ""}`}
      >
        <div className="landing-nav-container">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <i className="bi bi-layers"></i>
            </div>
            <span className="landing-logo-text">NCDMB</span>
          </div>

          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">
              Features
            </a>
            <a href="#services" className="landing-nav-link">
              Services
            </a>
            <a href="#about" className="landing-nav-link">
              About
            </a>
            <a href="#contact" className="landing-nav-link">
              Contact
            </a>
          </div>

          <button
            className="landing-login-btn"
            onClick={() => navigate("/auth/login")}
          >
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Staff Login</span>
          </button>
        </div>

        {/* Scroll Progress */}
        <div
          className="scroll-progress"
          style={{
            width: `${Math.min(
              (scrollY /
                (document.documentElement.scrollHeight - window.innerHeight)) *
                100,
              100
            )}%`,
          }}
        />
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div
          className="landing-hero-bg"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="hero-gradient-orb hero-gradient-orb-1"></div>
          <div className="hero-gradient-orb hero-gradient-orb-2"></div>
          <div className="hero-gradient-orb hero-gradient-orb-3"></div>
        </div>

        <div className="landing-hero-content">
          <div className="landing-hero-badge animate-in">
            <i className="bi bi-stars"></i>
            <span>Enterprise Document Management</span>
          </div>

          <h1 className="landing-hero-title animate-in delay-1">
            <span className="hero-title-line">Transform Your</span>
            <span className="hero-title-line hero-title-highlight">
              Document Workflow
            </span>
          </h1>

          <p className="landing-hero-subtitle animate-in delay-2">
            A comprehensive enterprise-grade platform built on the Storm
            Framework. Experience seamless document lifecycle management with
            AI-powered insights, advanced security, and intelligent automation.
          </p>

          <div className="landing-hero-actions animate-in delay-3">
            <button
              className="landing-hero-btn landing-hero-btn-primary"
              onClick={() => navigate("/auth/login")}
            >
              <span>Get Started</span>
              <i className="bi bi-arrow-right"></i>
            </button>
            <button className="landing-hero-btn landing-hero-btn-secondary">
              <i className="bi bi-play-circle"></i>
              <span>Watch Demo</span>
            </button>
          </div>

          <div className="landing-hero-stats animate-in delay-4">
            {stats.map((stat, index) => (
              <div key={index} className="hero-stat-item">
                <i className={`bi ${stat.icon}`}></i>
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="landing-hero-illustration animate-in delay-2"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="illustration-card illustration-card-1">
            <i className="bi bi-file-earmark-check"></i>
            <div className="illustration-pulse"></div>
          </div>
          <div className="illustration-card illustration-card-2">
            <i className="bi bi-graph-up"></i>
            <div className="illustration-pulse"></div>
          </div>
          <div className="illustration-card illustration-card-3">
            <i className="bi bi-shield-check"></i>
            <div className="illustration-pulse"></div>
          </div>
        </div>

        <div className="landing-scroll-indicator">
          <div className="scroll-indicator-mouse">
            <div className="scroll-indicator-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <div className="section-header-badge animate-on-scroll">
            <i className="bi bi-star"></i>
            <span>Core Features</span>
          </div>
          <h2 className="landing-section-title animate-on-scroll">
            Powerful Features for Modern Organizations
          </h2>
          <p className="landing-section-subtitle animate-on-scroll">
            Everything you need to manage, track, and optimize your document
            workflows
          </p>
        </div>

        <div className="landing-features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card animate-on-scroll ${
                activeFeature === index ? "feature-card-active" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <div
                className="feature-card-icon"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <i
                  className={`bi ${feature.icon}`}
                  style={{ color: feature.color }}
                ></i>
                <div
                  className="feature-icon-glow"
                  style={{ backgroundColor: feature.color }}
                ></div>
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-description">{feature.description}</p>
              <div className="feature-card-arrow">
                <i className="bi bi-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="landing-services">
        <div className="landing-services-container">
          <div className="landing-services-content">
            <div className="section-header-badge animate-on-scroll">
              <i className="bi bi-grid"></i>
              <span>Integrated Services</span>
            </div>
            <h2 className="landing-section-title animate-on-scroll">
              Comprehensive Service Ecosystem
            </h2>
            <p className="landing-section-subtitle animate-on-scroll">
              A complete suite of integrated services designed to streamline
              your operations
            </p>

            <div className="landing-services-grid">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="service-item animate-on-scroll"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="service-item-icon">
                    <i className={`bi ${service.icon}`}></i>
                  </div>
                  <div className="service-item-content">
                    <h4 className="service-item-title">{service.title}</h4>
                    <p className="service-item-description">
                      {service.description}
                    </p>
                  </div>
                  <i className="bi bi-chevron-right service-item-arrow"></i>
                </div>
              ))}
            </div>
          </div>

          <div
            className="landing-services-visual animate-on-scroll"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <div className="services-visual-center">
              <i className="bi bi-cpu"></i>
              <div className="services-visual-pulse"></div>
            </div>
            {services.map((_, index) => (
              <div
                key={index}
                className="services-visual-node"
                style={{
                  transform: `rotate(${
                    (360 / services.length) * index
                  }deg) translateY(-120px)`,
                }}
              >
                <div
                  className="services-visual-node-inner"
                  style={{
                    transform: `rotate(-${(360 / services.length) * index}deg)`,
                  }}
                >
                  <i className={`bi ${services[index].icon}`}></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-about">
        <div className="landing-about-container">
          <div
            className="landing-about-image animate-on-scroll"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <div className="about-image-card about-image-card-1">
              <i className="bi bi-building"></i>
              <span>NCDMB</span>
            </div>
            <div className="about-image-card about-image-card-2">
              <i className="bi bi-award"></i>
              <span>Certified</span>
            </div>
            <div className="about-image-card about-image-card-3">
              <i className="bi bi-globe"></i>
              <span>Global</span>
            </div>
          </div>

          <div className="landing-about-content">
            <div className="section-header-badge animate-on-scroll">
              <i className="bi bi-info-circle"></i>
              <span>About Us</span>
            </div>
            <h2 className="landing-section-title animate-on-scroll">
              Nigerian Content Development and Monitoring Board
            </h2>
            <div className="landing-about-text animate-on-scroll">
              <p>
                The NCDMB Document Management System is built on the
                cutting-edge Storm Framework, a TypeScript-based web application
                designed for modularity, scalability, and maintainability.
              </p>
              <p>
                Our platform serves as a complete document lifecycle management
                solution, offering enterprise-grade features including advanced
                security, AI-powered analysis, and seamless collaboration tools.
              </p>
              <p>
                With over 50+ business entities, sub-50ms performance, and 99.9%
                uptime, we deliver reliability and excellence in every
                interaction.
              </p>
            </div>

            <div className="landing-about-features animate-on-scroll">
              <div className="about-feature-item">
                <i className="bi bi-check-circle"></i>
                <span>Enterprise-Grade Security</span>
              </div>
              <div className="about-feature-item">
                <i className="bi bi-check-circle"></i>
                <span>AI-Powered Insights</span>
              </div>
              <div className="about-feature-item">
                <i className="bi bi-check-circle"></i>
                <span>24/7 Support</span>
              </div>
              <div className="about-feature-item">
                <i className="bi bi-check-circle"></i>
                <span>Cloud-Based Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="landing-cta">
        <div className="landing-cta-bg">
          <div className="cta-gradient-orb cta-gradient-orb-1"></div>
          <div className="cta-gradient-orb cta-gradient-orb-2"></div>
        </div>

        <div className="landing-cta-content animate-on-scroll">
          <h2 className="landing-cta-title">Ready to Get Started?</h2>
          <p className="landing-cta-subtitle">
            Join the future of document management and experience the power of
            intelligent automation
          </p>
          <div className="landing-cta-actions">
            <button
              className="landing-cta-btn landing-cta-btn-primary"
              onClick={() => navigate("/auth/login")}
            >
              <span>Access Portal</span>
              <i className="bi bi-arrow-right"></i>
            </button>
            <button className="landing-cta-btn landing-cta-btn-secondary">
              <i className="bi bi-envelope"></i>
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-grid">
            <div className="landing-footer-col">
              <div className="landing-footer-logo">
                <div className="landing-logo-icon">
                  <i className="bi bi-layers"></i>
                </div>
                <span className="landing-logo-text">NCDMB Portal</span>
              </div>
              <p className="landing-footer-description">
                Enterprise document management system built for the modern
                organization.
              </p>
            </div>

            <div className="landing-footer-col">
              <h4 className="landing-footer-title">Quick Links</h4>
              <ul className="landing-footer-links">
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#services">Services</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>

            <div className="landing-footer-col">
              <h4 className="landing-footer-title">Services</h4>
              <ul className="landing-footer-links">
                <li>
                  <a href="#">Budget Management</a>
                </li>
                <li>
                  <a href="#">Inventory Control</a>
                </li>
                <li>
                  <a href="#">Logistics</a>
                </li>
                <li>
                  <a href="#">Support</a>
                </li>
              </ul>
            </div>

            <div className="landing-footer-col">
              <h4 className="landing-footer-title">Contact</h4>
              <ul className="landing-footer-links">
                <li>
                  <i className="bi bi-envelope"></i>
                  <span>support@ncdmb.gov.ng</span>
                </li>
                <li>
                  <i className="bi bi-telephone"></i>
                  <span>+234 xxx xxx xxxx</span>
                </li>
                <li>
                  <i className="bi bi-geo-alt"></i>
                  <span>Yenagoa, Bayelsa State</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <p>&copy; {new Date().getFullYear()} NCDMB. All rights reserved.</p>
            <div className="landing-footer-social">
              <a href="#" className="footer-social-link">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="footer-social-link">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="footer-social-link">
                <i className="bi bi-facebook"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
