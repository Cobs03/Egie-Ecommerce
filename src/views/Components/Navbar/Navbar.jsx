import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../../src/index.css";
import "flowbite";
import { IoIosNotifications } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import { FaSquareFacebook } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import { useCart } from "../../../context/CartContext";
import NotificationService from "../../../services/NotificationService";

import { FaCodeCompare } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { FaTiktok } from "react-icons/fa";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = ({ isAuth }) => {
  const { cartCount } = useCart(); // Real cart count from database
  const [notificationCount, setNotificationCount] = useState(0);
  const { user, signOut } = useAuth();
  
  // Profile state for avatar
  const [userAvatar, setUserAvatar] = useState("https://randomuser.me/api/portraits/men/32.jpg");
  const [userFullName, setUserFullName] = useState("");

  const navigate = useNavigate();

  const location = useLocation();

  // Fetch notification count
  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      
      // Subscribe to real-time updates from database
      const subscription = NotificationService.subscribeToNotifications(() => {
        fetchNotificationCount();
      });

      // Listen for manual mark as read events
      const handleNotificationRead = () => {
        fetchNotificationCount();
      };

      window.addEventListener('notificationRead', handleNotificationRead);

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('notificationRead', handleNotificationRead);
      };
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    const { count } = await NotificationService.getUnreadCount();
    setNotificationCount(count);
  };
  const isProductsActive = location.pathname.startsWith("/products");

  const isActive = (path) => location.pathname === path;

  // State to track dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to close dropdown
  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Modified handleSignOut to also close the dropdown
  const handleSignOut = async () => {
    try {
      await signOut();
      closeDropdown();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileAccordion, setShowProfileAccordion] = useState(false);

  // Load user avatar and name
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          return;
        }

        if (data) {
          if (data.avatar_url) {
            setUserAvatar(data.avatar_url);
          }
          if (data.first_name && data.last_name) {
            setUserFullName(`${data.first_name} ${data.last_name}`);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error.message);
      }
    };

    loadUserProfile();

    // Subscribe to profile changes
    if (user) {
      const channel = supabase
        .channel(`profile-changes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile changed:', payload);
            if (payload.new) {
              if (payload.new.avatar_url) {
                setUserAvatar(payload.new.avatar_url);
              }
              if (payload.new.first_name && payload.new.last_name) {
                setUserFullName(`${payload.new.first_name} ${payload.new.last_name}`);
              }
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Replace this with your actual search logic
      alert(`Searching for: ${searchQuery}`);
    }
  };

  // Function to navigate and close dropdown
  const navigateAndClose = (path) => {
    closeDropdown();
    navigate(path);
  };

  return (
    <div className={`navbar ${isAuth ? "auth-navbar" : "main-navbar"}`}>
      {isAuth ? (
        <div className="auth-header "></div>
      ) : (
        <div className="main-header">
          <nav className="bg-gradient-to-r from-green-200 to-green-300 border-gray-200 w-full min-w-[320px] md:min-w-[768px] lg:min-w-[1024px] xl:min-w-[1280px] fixed top-0 left-0 right-0 z-[500] ">
            {/* UPPER NAVBAR - Desktop */}
            <div className="hidden md:flex bg-gradient-to-r from-green-100 to-green-300 text-black px-5 py-1 justify-around items-center w-full h-10">
              <div className="text-[10px] font-bold">
                Mon–Sunday: 8:00 AM – 5:30 PM
              </div>
              <div className="text-center text-[12px] font-bold items-center gap-1 md:gap-2">
                Visit our showroom in 1234 Street Address City Address, 1234{" "}
                <a
                  href="#"
                  className="underline text-gray-700 hover:text-black ml-1"
                >
                  Contact Us
                </a>
              </div>
              <div className="text-center text-[10px] font-bold">
                <span>Call Us: +639151855519</span>
              </div>
              <div className="flex items-center gap-2 md:gap-4 text-base md:text-lg font-bold">
                <a
                  href="https://www.facebook.com/EGIEGameShop/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaSquareFacebook className="text-lg md:text-xl hover:text-[#4AA3E8]" />
                </a>
                <a
                  href="https://www.instagram.com/egie_gameshop/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AiFillInstagram className="text-xl md:text-2xl hover:text-[#4AA3E8]" />
                </a>
                <a href="#" className="text-lg md:text-xl">
                  <FaTiktok className="text-lg md:text-xl hover:text-[#4AA3E8]" />
                </a>
              </div>
            </div>

            {/* BOTTOM NAVBAR */}
            <div className="w-full flex items-center justify-between bg-black py-2 px-8">
              {/* LEFT LINKS - Hidden on mobile */}
              <NavigationMenu className="hidden md:flex flex-1">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link
                      to="/"
                      className={`text-shadow-white transition px-2 md:px-4 py-2 text-xs md:text-sm whitespace-nowrap ${
                        isActive("/")
                          ? "text-green-400 font-semibold"
                          : "text-white hover:text-green-400"
                      }`}
                    >
                      Home
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link
                      to="/products"
                      className={`text-shadow-white transition px-2 md:px-4 py-2 text-xs md:text-sm whitespace-nowrap ${
                        isActive("/products")
                          ? "text-green-400 font-semibold"
                          : "text-white hover:text-green-400"
                      }`}
                    >
                      All Products
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link
                      to="/buildpc"
                      className={`text-shadow-white transition px-2 md:px-4 py-2 text-xs md:text-sm whitespace-nowrap ${
                        isActive("/buildpc")
                          ? "text-green-400 font-semibold"
                          : "text-white hover:text-green-400"
                      }`}
                    >
                      PC Build
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* LOGO CENTERED */}
              <div className="flex-1 flex justify-center md:flex-1 max-md:justify-start">
                <Link to="/">
                  <img
                    src="https://i.ibb.co/tp4Bkfzs/egie-removebg-preview-1.png"
                    alt="EGIE logo"
                    border="0"
                  />
                </Link>
              </div>

              {/* RIGHT: Search + Auth Buttons */}
              <div className="flex items-center gap-4 ">
                {/* Search Icon Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className=" transition flex items-center cursor-pointer justify-center w-10 h-10 rounded-full bg-white text-black border border-gray-300 hover:bg-gray-100 focus:outline-none"
                        aria-label="Search"
                        onClick={() => setShowSearchBar((prev) => !prev)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-white text-black border border-gray-200 shadow z-[9999]"
                    >
                      Search
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {user ? (
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-8 max-md:hidden">
                      {/* Notification Icon - Hidden on mobile */}
                      <TooltipProvider className="md:hidden">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to="/notification"
                              className="relative focus:outline-none"
                              aria-label="Notifications"
                            >
                              <IoIosNotifications className="text-2xl sm:text-3xl md:text-4xl text-lime-400 hover:text-lime-500 transition cursor-pointer" />
                              {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                  {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                              )}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="bg-white text-black border border-gray-200 shadow z-[9999]"
                          >
                            Notifications
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* Cart Icon - Hidden on mobile */}
                      <TooltipProvider className="md:hidden">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to="/cart"
                              className="relative focus:outline-none"
                              aria-label="Cart"
                            >
                              <FaShoppingCart className="text-xl sm:text-2xl md:text-3xl text-lime-400 hover:text-lime-500 transition cursor-pointer" />
                              {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                  {cartCount > 99 ? '99+' : cartCount}
                                </span>
                              )}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="bg-white text-black border border-gray-200 shadow z-[9999]"
                          >
                            Cart ({cartCount})
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* Compare Icon - Hidden on mobile */}
                      <TooltipProvider className="md:hidden">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              to="/compare"
                              className="relative focus:outline-none"
                              aria-label="Compare"
                            >
                              <FaCodeCompare className="text-xl sm:text-2xl md:text-3xl text-lime-400 hover:text-lime-500 transition cursor-pointer" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="bg-white text-black border border-gray-200 shadow z-[9999]"
                          >
                            Compare
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-8">
                      {/* Profile Menu using dropdown */}
                      <DropdownMenu
                        open={isDropdownOpen}
                        onOpenChange={setIsDropdownOpen}
                      >
                        <DropdownMenuTrigger asChild>
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black border border-gray-300 hover:bg-gray-100 cursor-pointer max-md:hidden">
                            <img
                              src={userAvatar}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 z-[10000] font-['Bruno_Ace_SC'] bg-white">
                          {/* User Info Section */}
                          <div className="px-3 py-2 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">
                              {userFullName || user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                          
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              navigate("/settings");
                              closeDropdown();
                            }}
                          >
                            <svg
                              className="mr-3 h-5 w-5 text-zinc-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Profile</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => navigateAndClose("/purchases")}
                          >
                            <svg
                              className="mr-3 h-5 w-5 text-zinc-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>My Purchases</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => navigateAndClose("/my-inquiries")}
                          >
                            <svg
                              className="mr-3 h-5 w-5 text-zinc-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>My Inquiries</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => navigateAndClose("/settings")}
                          >
                            <svg
                              className="mr-3 h-5 w-5 text-zinc-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Settings</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              navigateAndClose("/contactus");
                            }}
                          >
                            <svg
                              className="mr-3 h-5 w-5 text-zinc-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>Help center</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={handleSignOut}
                          >
                            <svg
                              className="mr-3 h-5 w-5 text-zinc-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" x2="9" y1="12" y2="12" />
                            </svg>
                            <span className="text-red-600">Sign Out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* Hamburger Menu Button - Visible only on mobile */}
                      <button
                        className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-white text-black border border-gray-300 hover:bg-gray-100 focus:outline-none"
                        aria-label="Menu"
                        onClick={() => setShowMobileMenu((prev) => !prev)}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Sign In/Sign Up Buttons (keep as fallback) */}
                    <Link
                      to="/signin"
                      className="px-6 py-2 border-2 border-green-400 text-white rounded-full hover:bg-green-400 hover:text-black transition font-semibold"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth"
                      className="px-6 py-2 border-2 border-green-400 text-white rounded-full hover:bg-green-400 hover:text-black transition font-semibold"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile Menu - Code unchanged */}
          {showMobileMenu && (
            <div
              className="lg:hidden bg-black border-t border-gray-700"
              style={{
                position: "fixed",
                top: "90px",
                left: 0,
                right: 0,
                zIndex: 2000,
              }}
            >
              <div className="px-4 py-2 space-y-2">
                {/* Navigation Links */}
                <div className="space-y-1">
                  <Link
                    to="/"
                    className={`block px-3 py-2 text-sm rounded-lg transition ${
                      isActive("/")
                        ? "text-green-400 font-semibold bg-gray-800"
                        : "text-white hover:text-green-400 hover:bg-gray-800"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className={`block px-3 py-2 text-sm rounded-lg transition ${
                      isActive("/products")
                        ? "text-green-400 font-semibold bg-gray-800"
                        : "text-white hover:text-green-400 hover:bg-gray-800"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    All Products
                  </Link>
                  <Link
                    to="/buildpc"
                    className={`block px-3 py-2 text-sm rounded-lg transition ${
                      isActive("/buildpc")
                        ? "text-green-400 font-semibold bg-gray-800"
                        : "text-white hover:text-green-400 hover:bg-gray-800"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    PC Build
                  </Link>
                  <Link
                    to="/compare"
                    className={`block px-3 py-2 text-sm rounded-lg transition ${
                      isActive("/compare")
                        ? "text-green-400 font-semibold bg-gray-800"
                        : "text-white hover:text-green-400 hover:bg-gray-800"
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Compare
                  </Link>
                </div>
                {/* Profile Accordion */}
                <div className="border-t border-gray-700 pt-2">
                  <button
                    className="flex items-center w-full px-3 py-2 text-white hover:text-green-400 transition rounded-lg"
                    onClick={() => setShowProfileAccordion((prev) => !prev)}
                  >
                    <img
                      src={userAvatar}
                      alt="Profile"
                      className="w-7 h-7 rounded-full object-cover mr-2"
                    />
                    <span className="flex-1 text-left">Profile</span>
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${
                        showProfileAccordion ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {showProfileAccordion && (
                    <div className="pl-10 py-1 space-y-1">
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-white hover:text-green-400"
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowProfileAccordion(false);
                          navigate("/settings");
                        }}
                      >
                        Profile
                      </button>
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-white hover:text-green-400"
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowProfileAccordion(false);
                          navigate("/purchases");
                        }}
                      >
                        My Purchases
                      </button>
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-white hover:text-green-400"
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowProfileAccordion(false);
                          navigate("/my-inquiries");
                        }}
                      >
                        My Inquiries
                      </button>
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-white hover:text-green-400"
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowProfileAccordion(false);
                          navigate("/settings");
                        }}
                      >
                        Settings
                      </button>
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-white hover:text-green-400"
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowProfileAccordion(false);
                          // Help Center logic here
                        }}
                      >
                        Help Center
                      </button>
                      <button
                        className="block w-full text-left px-2 py-1 text-sm text-red-400 hover:text-red-600"
                        onClick={() => {
                          setShowMobileMenu(false);
                          setShowProfileAccordion(false);
                          handleSignOut();
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                {/* Icons */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-700">
                  <Link
                    to="/notification"
                    className="relative flex items-center gap-2 px-3 py-2 text-white hover:text-green-400 transition"
                    aria-label="Notifications"
                  >
                    <IoIosNotifications className="text-lg sm:text-xl md:text-2xl" />
                    <span className="text-xs sm:text-sm">Notifications</span>
                    {notificationCount > 0 && (
                      <span className="absolute top-1 left-6 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    className="relative flex items-center gap-2 px-3 py-2 text-white hover:text-green-400 transition"
                    aria-label="Cart"
                  >
                    <div className="relative">
                      <FaShoppingCart className="text-base sm:text-lg md:text-xl" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm">Cart ({cartCount})</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Search bar - Code unchanged */}
          {showSearchBar !== undefined && (
            <div
              className={`fixed left-0 right-0 top-[130px] z-50 flex justify-center bg-transparent p-1 transition-all duration-300 ease-in-out
                ${
                  showSearchBar
                    ? "translate-y-0 opacity-100 pointer-events-auto"
                    : "-translate-y-8 opacity-0 pointer-events-none"
                }`}
              style={{ pointerEvents: showSearchBar ? "auto" : "none" }}
            >
              <div
                className="flex items-center bg-white rounded-full px-2 sm:px-3 md:px-4 py-2 w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-1/2 shadow-lg border-5 border-black"
                style={{ pointerEvents: "auto" }}
              >
                <input
                  type="text"
                  className="flex-1 bg-transparent text-black border-none outline-none focus:outline-0 focus:border-0 w-full pl-8 sm:pl-10 rounded-full text-sm sm:text-base"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-1 sm:mr-2 absolute ml-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <button
                  onClick={handleSearch}
                  className="ml-1 sm:ml-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-green-400 text-black rounded-full font-semibold hover:bg-green-500 transition text-xs sm:text-sm md:text-base"
                >
                  Search
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;