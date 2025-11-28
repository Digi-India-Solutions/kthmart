"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function LoginSidebar() {
  const [open, setOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  return (
    <>
      {/* Open Sidebar Button */}
      <button
        onClick={() => {
          setOpen(true);
          setIsRegister(false);
        }}
        className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition font-medium"
      >
        Login
      </button>

      {/* AnimatePresence for smooth mount/unmount */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-10 cursor-pointer"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-20 flex flex-col rounded-l-3xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {isRegister ? "Create Account" : "Welcome Back"}
                </h2>
                <button onClick={() => setOpen(false)}>
                  <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
                </button>
              </div>

              {/* Form Section */}
              <div className="flex-1 overflow-y-auto px-6 py-8">
                {!isRegister ? (
                  <>
                    {/* Login Form */}
                    <form className="flex flex-col gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                          placeholder="••••••••"
                        />
                        <div className="text-right mt-1">
                          <a
                            href="#"
                            className="text-sm text-green-600 hover:underline"
                          >
                            Forgot Password?
                          </a>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Sign In
                      </button>
                    </form>

                    {/* OR Divider */}
                    <div className="flex items-center my-5">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="px-3 text-gray-500 text-sm">or</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    {/* Social Login */}
                    <div className="flex flex-col gap-3">
                      <button className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
                        <FcGoogle size={22} /> Login with Google
                      </button>
                      <button className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition text-blue-600 font-medium">
                        <FaFacebook size={22} color="#1877F2" /> Login with Facebook
                      </button>
                    </div>

                    {/* Switch to Register */}
                    <p className="text-sm text-gray-600 text-center mt-6">
                      Don’t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsRegister(true)}
                        className="text-green-600 font-medium hover:underline"
                      >
                        Register Now
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    {/* Register Form */}
                    <form className="flex flex-col gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                          placeholder="••••••••"
                        />
                      </div>

                      <button
                        type="submit"
                        className="mt-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        Register
                      </button>
                    </form>

                    {/* Social Register */}
                    <div className="flex items-center my-5">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="px-3 text-gray-500 text-sm">or</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
                        <FcGoogle size={22} /> Sign up with Google
                      </button>
                      <button className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition text-blue-600 font-medium">
                        <FaFacebook size={22} color="#1877F2" /> Sign up with Facebook
                      </button>
                    </div>

                    {/* Switch to Login */}
                    <p className="text-sm text-gray-600 text-center mt-6">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsRegister(false)}
                        className="text-green-600 font-medium hover:underline"
                      >
                        Login
                      </button>
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
