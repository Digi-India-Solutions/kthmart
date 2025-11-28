"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ShoppingCart,
  Heart,
  Menu,
  User,
  Search,
  Home,
  UserCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  WalletCards,
  Settings,
  Bell,
  Gift,
  PlusCircle,
  MessageCircle,
  LogOut,
  Leaf,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/redux/features/auth/loginSlice";
import Image from "next/image";

import logo from "../../Images/DowloadImage/logo1.png";

const Navbar = () => {
  const [location, setLocation] = useState("Detecting location...");
  const [showDesktopMenu, setShowDesktopMenu] = useState(false); // SAME menu for mobile + desktop
  const [vegMode, setVegMode] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.login);
  const isLoggedIn = Boolean(user);

  // Detect Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setLocation(
            data.address?.suburb ||
              data.address?.city_district ||
              data.address?.city ||
              data.address?.state ||
              "Unknown Location"
          );
        } catch {
          setLocation("Unable to fetch location");
        }
      },
      () => setLocation("Location access denied")
    );
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
  
    delete axiosInstance.defaults.headers.common["Authorization"];
  
    window.location.href = "/pages/login";
  };
  

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <nav className="hidden md:flex w-full fixed top-0 left-0 z-50 bg-white shadow-sm px-10 py-3 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>

          <div className="text-sm">
            <span className="text-gray-500">Delivery in</span>
            <p className="text-gray-700">
              Guest Outlet: <span className="font-semibold">{location}</span>
            </p>
          </div>

          <span className="cursor-pointer font-medium">Catalogue</span>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 px-6 py-3 rounded-full w-[500px]">
          <Search className="w-4 h-4 text-red-400 mr-2" />
          <input
            type="text"
            placeholder="Search ‘Fresh Cream’"
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <>
              {/* DESKTOP MENU BUTTON */}
              <button
                onClick={() => setShowDesktopMenu(true)}
                className="flex items-center gap-1 font-medium hover:text-red-500"
              >
                <Menu className="w-5 h-5" /> Menu
              </button>

              <Link href="/pages/cart">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
              </Link>

              <Link href="/pages/wishlist">
                <Heart className="w-6 h-6 text-gray-700" />
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/pages/login"
                className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
              >
                Login
              </Link>

              {/* <Link
                href="/pages/signup"
                className="bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold"
              >
                Signup
              </Link> */}
            </>
          )}
        </div>
      </nav>

      {/* ================= MOBILE NAVBAR TOP ================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <Link href="/">
            <Image src={logo} alt="Logo" className="h-6 w-auto" />
          </Link>

          <button
            onClick={() => setShowDesktopMenu(true)}
            className="text-gray-800 text-2xl font-bold"
          >
            ☰
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/*           SAME DROPDOWN FOR DESKTOP + MOBILE FULLSCREEN       */}
      {/* ============================================================= */}
      {showDesktopMenu && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex"
    onClick={() => setShowDesktopMenu(false)} // clicking outside closes
  >
    {/* RIGHT SIDE MENU PANEL */}
    <div
      className="
        bg-gray-100 w-full md:w-[350px]
        h-full overflow-y-auto p-4 shadow-2xl
        ml-auto relative animate-slideIn
      "
      onClick={(e) => e.stopPropagation()} // prevent close on inside click
    >
      {/* CROSS BUTTON (DESKTOP + MOBILE) */}
      <button
        onClick={() => setShowDesktopMenu(false)}
        className="absolute top-4 right-4 text-3xl font-bold text-gray-700 hover:text-red-600 z-[1000]"
      >
        ×
      </button>

      {/* ============================================================ */}
      {/* YOUR ORIGINAL MENU CONTENT — 100% SAME — NOTHING CHANGED     */}
      {/* ============================================================ */}

      {/* Header */}
      <div className="flex items-center gap-3 bg-white rounded-2xl  mb-3 p-1 shadow-sm mt-10">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <UserCircle2 className="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">Guest Outlet</p>
          <p className="text-xs text-gray-500">Guest Account</p>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl mb-3 shadow-sm">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span className="h-4 w-1 rounded-full bg-red-500" />
          <p className="text-sm font-semibold text-gray-800">
            Orders & statements
          </p>
        </div>

        <Link
          href="/pages/cart"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <ClipboardList className="w-4 h-4" />
            Your orders
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/pages/wishlist"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <FileText className="w-4 h-4" />
            Wishlist
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/pages/privacy-policy"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 rounded-b-2xl"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <HelpCircle className="w-4 h-4" />
            Privacy Policy
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* Wallet */}
      {/* <div className="bg-white rounded-2xl mb-3 shadow-sm">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span className="h-4 w-1 rounded-full bg-red-500" />
          <p className="text-sm font-semibold text-gray-800">
            Wallet & payment
          </p>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 rounded-b-2xl">
          <span className="flex items-center gap-2 text-gray-700">
            <WalletCards className="w-4 h-4" />
            Hyperpure wallet
          </span>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
            ₹300
          </span>
        </div>
      </div> */}

      {/* Others */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span className="h-4 w-1 rounded-full bg-red-500" />
          <p className="text-sm font-semibold text-gray-800">Others</p>
        </div>

        <Link
          href="/pages/checkout"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Settings className="w-4 h-4" />
            Checkout
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        {/* Veg mode */}
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <span className="flex items-center gap-2 text-gray-700">
            <span className="h-4 w-4 rounded-full border flex items-center justify-center border-emerald-500">
              <Leaf className="w-3 h-3 text-emerald-600" />
            </span>
            Veg mode
          </span>
          <button
            onClick={() => setVegMode(!vegMode)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
              vegMode ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                vegMode ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <Link
          href="/pages/contact"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Bell className="w-4 h-4" />
            Contact Us
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/pages/wishlist"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Heart className="w-4 h-4" />
            My list
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/pages/bestSellerbook"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <Gift className="w-4 h-4" />
            best Seller Products
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/pages/featurebook"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <PlusCircle className="w-4 h-4" />
            Feature Product
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <Link
          href="/pages/categories"
          onClick={() => setShowDesktopMenu(false)}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 rounded-b-2xl"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <MessageCircle className="w-4 h-4" />
            Categories
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 mt-2 justify-start px-4 py-3 text-sm font-semibold text-red-500 bg-white rounded-2xl shadow-sm hover:bg-red-50"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  </div>
)}


      {/* ================= MOBILE BOTTOM NAVBAR ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex justify-around py-3 z-50">
        <Link
          href="/"
          className="flex flex-col items-center text-gray-700 text-xs"
        >
          <Home className="w-5 h-5 mb-1" />
          <span>Home</span>
        </Link>

        <Link
          href="/pages/wishlist"
          className="flex flex-col items-center text-gray-700 text-xs"
        >
          <Heart className="w-5 h-5 mb-1" />
          <span>Wishlist</span>
        </Link>

        <Link
          href="/pages/cart"
          className="flex flex-col items-center text-gray-700 text-xs"
        >
          <ShoppingCart className="w-5 h-5 mb-1" />
          <span>Cart</span>
        </Link>

        {isLoggedIn ? (
          <Link
            href="/pages/privacy-policy"
            className="flex flex-col items-center text-gray-700 text-xs"
          >     6
            <User   className="w-5 h-5 mb-1" />
            <span>Privacy Policy</span>
          </Link>
        ) : (
          <Link
            href="/pages/login"
            className="flex flex-col items-center text-red-500 text-xs"
          >
            <User className="w-5 h-5 mb-1" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </>
  );
};

export default Navbar;
