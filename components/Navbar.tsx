"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, User, LogOut, ShoppingBag, X, Menu } from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fd-navbar">
      <div className="fd-navbar-inner">
        {/* Logo */}
        <Link href="/" className="fd-logo">
          <span className="fd-logo-food">Food</span>
          <span className="fd-logo-iffin">iffin</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="fd-nav-links">
          <Link href="/" className="fd-nav-link">
            Home
          </Link>
          <a href="#dishes" className="fd-nav-link">
            Menu
          </a>
          <a href="#about" className="fd-nav-link">
            About
          </a>
        </div>

        {/* Right Side */}
        <div className="fd-navbar-right">
          {/* Search */}
          <div className="fd-search-wrap">
            <Search className="fd-search-icon" size={17} />
            <input
              id="navbar-search"
              type="text"
              placeholder="Search for dishes..."
              className="fd-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                className="fd-search-clear"
                onClick={() => onSearchChange("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="fd-profile-wrap" ref={dropdownRef}>
            <button
              id="profile-btn"
              className="fd-profile-btn"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Profile menu"
            >
              <User size={20} />
            </button>

            {dropdownOpen && (
              <div className="fd-dropdown" role="menu">
                <div className="fd-dropdown-header">
                  <div className="fd-dropdown-avatar">Y</div>
                  <div>
                    <p className="fd-dropdown-name">Yash</p>
                    <p className="fd-dropdown-email">yash@foodiffin.com</p>
                  </div>
                </div>
                <div className="fd-dropdown-divider" />
                <Link
                  href="/profile"
                  className="fd-dropdown-item"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={15} /> Profile
                </Link>
                <button className="fd-dropdown-item" role="menuitem">
                  <ShoppingBag size={15} /> My Orders
                </button>
                <div className="fd-dropdown-divider" />
                <Link
                  href="/(auth)/login"
                  className="fd-dropdown-item fd-dropdown-logout"
                  role="menuitem"
                >
                  <LogOut size={15} /> Logout
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="fd-mobile-menu-btn"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="fd-mobile-nav">
          <Link
            href="/"
            className="fd-mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <a
            href="#dishes"
            className="fd-mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Menu
          </a>
          <a
            href="#about"
            className="fd-mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </a>
        </div>
      )}
    </nav>
  );
}
