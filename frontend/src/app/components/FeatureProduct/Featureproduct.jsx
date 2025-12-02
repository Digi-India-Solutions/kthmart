"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import axiosInstance, { serverUrl } from "@/app/redux/features/axiosInstance";

import { addToCart } from "@/app/redux/AddtoCart/cartSlice";
import {
  addToWishlist,
  addToWishlistApi,
  addToWishlistState,
  removeFromWishlist,
  removeFromWishlistApi,
  removeFromWishlistState,
} from "@/app/redux/wishlistSlice";
import {
  addToCartAPIThunk,
  addtoCartState,
} from "@/app/redux/AddtoCart/apiCartSlice";
import { verifyUser } from "@/app/redux/features/auth/loginSlice";

import CallBackImg from "../../Images/DBS/DBSLOGO.jpg";

const BestSeller = ({ productlength = 4, btnlength = 8 }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { cartItems } = useSelector((state) => state.cart);
  const { items: apiCartItems } = useSelector((state) => state.apiCart);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const user = useSelector((state) => state.login.user);

  const [products, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Global quantity & price per product stored here
  const [quantities, setQuantities] = useState({});
  const [prices, setPrices] = useState({});

  const cartItemsValue = user?.email ? apiCartItems : cartItems;

  useEffect(() => {
    dispatch(verifyUser());
    const fetchBestSellers = async () => {
      try {
        const res = await axiosInstance.get("/product/get-best-selling-books");
        console.log("🔥 Best Seller API Response:", res.data.products);
        setProduct(res.data.products || []);
      } catch (err) {
        setError("Failed to load Best Seller Products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, [dispatch]);

  // 🧮 FIXED: Package-based pricing calculation with number conversion
  const getPricePerPc = (product, qty) => {
    try {
      const basePrice = Number(product?.finalPrice) || 26.56;
      const tiers = product?.package || [];
    
      if (!tiers || tiers.length === 0) return basePrice;
    
      // Sort tiers by stock ascending
      const sorted = [...tiers].sort((a, b) => Number(a.stock) - Number(b.stock));
    
      let price = basePrice;
    
      sorted.forEach((tier) => {
        if (qty >= Number(tier.stock)) {
          price = Number(tier.price) || basePrice;
        }
      });
    
      return Number(price);
    } catch (error) {
      console.error("Error calculating price:", error);
      return Number(product?.finalPrice) || 26.56;
    }
  };

  // 🧮 Get active package index
  const getActivePackage = (product, qty) => {
    const tiers = product?.package ?? [];
    const sorted = [...tiers].sort((a, b) => Number(a.stock) - Number(b.stock));
  
    // If quantity exactly matches a package stock → activate that package
    const exactMatchIndex = sorted.findIndex(tier => Number(tier.stock) === qty);
    if (exactMatchIndex !== -1) return exactMatchIndex;
  
    // Otherwise use the normal logic
    let active = null;
    sorted.forEach((tier, index) => {
      if (qty >= Number(tier.stock)) active = index;
    });
  
    return active;
  };
  

  // 🧮 Check if package should be hidden
  const shouldHidePackage = (product, qty, index) => {
    const activeIndex = getActivePackage(product, qty);
  
    // If a package is active → hide all lower ones
    if (activeIndex !== null && index < activeIndex) return true;
  
    return false;
  };

  // 💡 UPDATED: Handles all cart updates and price recalculations
  const updateQuantity = (product, newQty) => {
    const tierPrice = getPricePerPc(product, newQty);

    setQuantities((prev) => ({ ...prev, [product._id]: newQty }));
    setPrices((prev) => ({ ...prev, [product._id]: tierPrice }));

    if (newQty > 0) handleCartUpdate(product, newQty);
  };

  

  // 🛒 Handles add or update to Redux / API cart
  const handleCartUpdate = (product, qty) => {
    const cartItem = {
      id: product._id,
      name: product.title,
      image: product.images[0],
      price: product.finalPrice,
      finalPrice: product.finalPrice,
      quantity: qty,
    };

    const exists = user?.email
      ? apiCartItems.some((item) => item?.productId?._id === product._id)
      : cartItems.some((item) => item?.id === product._id);

    if (!user?.email) {
      dispatch(addToCart(cartItem));
      toast.success(
        exists
          ? `${product.title} quantity updated.`
          : `${product.title} added to your cart!`
      );
    } else {
      dispatch(addtoCartState({ id: product._id }));
      dispatch(addToCartAPIThunk({ productId: product._id, quantity: qty }));
      toast.success(
        exists
          ? `${product.title} quantity updated.`
          : `${product.title} added to your cart!`
      );
    }
  };

  // ❤️ Wishlist
  const handleAddToWishlist = (_id, title, images, finalPrice, price) => {
    const isInWishlist = user?.email
      ? wishlistItems?.some((item) => item?._id === _id)
      : wishlistItems?.some((item) => item.id === _id);

    if (user?.email) {
      if (isInWishlist) {
        dispatch(removeFromWishlistState(_id));
        dispatch(removeFromWishlistApi(_id));
        toast.error("Removed from wishlist.");
      } else {
        dispatch(addToWishlistState({ _id }));
        dispatch(addToWishlistApi({ productId: _id }));
        toast.success(`"${title}" added to wishlist.`);
      }
    } else {
      if (isInWishlist) {
        dispatch(removeFromWishlist(_id));
        toast.error("Removed from wishlist.");
      } else {
        dispatch(
          addToWishlist({
            id: _id,
            name: title,
            image: images,
            price: finalPrice,
            oldPrice: price,
          })
        );
        toast.success(`"${title}" added to wishlist.`);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse space-y-3 border border-gray-200 rounded-lg shadow p-4"
          >
            <div className="w-full h-40 bg-gray-300 rounded-md"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500">{error}</div>;

  const visibleProducts =
    products?.length > productlength
      ? products.slice(0, productlength)
      : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Best Seller</h2>
          <p className="text-sm max-w-48 md:max-w-full text-gray-500">
            Explore the most popular books people love at Kthmart
          </p>
        </div>
        {pathname !== "/pages/bestseller" && (
          <Link href="/pages/bestseller">
            <button className="view-all-btn">
              View All <ArrowRight size={16} />
            </button>
          </Link>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {visibleProducts.map((product) => {
          const qty = quantities[product._id] || 0;
          const pricePerPc = getPricePerPc(product, qty);
          const total = (qty * pricePerPc).toFixed(2);
          const basePrice = Number(product?.finalPrice) || 26.56;
          
          // FIXED: Ensure numbers for calculations
          const numericPricePerPc = Number(pricePerPc);
          const numericBasePrice = Number(basePrice);
          
          // Calculate savings
          const saved = qty > 0 && numericPricePerPc < numericBasePrice
            ? ((numericBasePrice - numericPricePerPc) * qty).toFixed(2)
            : 0;

          const isInWishlist = user?.email
            ? wishlistItems?.some((item) => item._id === product._id)
            : wishlistItems?.some((item) => item.id === product._id);

          return (
            <div
              key={product._id}
              className="border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-2 relative"
            >
              {/* Discount Badge */}
              {typeof product.discount === "number" && product.discount > 0 && (
                <div className="absolute top-2 left-0 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-e-2xl z-10">
                  {product.discount}%
                </div>
              )}

              {/* Wishlist Icon */}
              <div
                className="absolute top-2 right-3 shadow-md rounded-full p-1 bg-white hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  handleAddToWishlist(
                    product._id,
                    product.title,
                    product.images[0],
                    product.finalPrice,
                    product.oldPrice
                  )
                }
              >
                {isInWishlist ? "❤️" : <Heart size={16} className="text-gray-700" />}
              </div>

              {/* Product Image */}
              <Link href={`/pages/shop/${product._id}`}>
                <div className="w-full h-40 flex justify-center items-center">
                  <Image
                    src={
                      product?.images?.[0]
                        ? `${serverUrl}/public/image/${product.images[0]}`
                        : CallBackImg
                    }
                    width={200}
                    height={200}
                    alt={product.title}
                    className="object-contain h-[80%]"
                  />
                </div>
              </Link>

              {/* Product Info */}
              <Link href={`/pages/shop/${product._id}`}>
                <h3 className="text-sm md:text-md font-semibold text-gray-800 line-clamp-2 mt-2">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-500 italic line-clamp-1">
                  {product.pages}
                </p>
              </Link>

              {/* Package Tiers with Hide/Show Logic */}
              <div className="mt-2 space-y-1">
                {product?.package?.map((item, index) => {
                  const isActive = getActivePackage(product, qty) === index;
                  const hide = shouldHidePackage(product, qty, index);

                  if (hide) return null;

                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-1 rounded text-xs ${
                        isActive 
                          ? "border-pink-600 bg-pink-50 border" 
                          : "border-gray-200 bg-gray-100 border"
                      }`}
                    >
                      <p className="text-xs">
                        ₹{Number(item.price).toFixed(2)}/{item.unit} — {item.stock}+{item.unit}
                      </p>

                      {isActive && <span className="text-pink-600 font-bold">✓</span>}

                      {!isActive && (
                        <button
                        onClick={() => updateQuantity(product, Number(item.stock))}

                          className="text-pink-600 text-xs font-semibold"
                        >
                          Add {item.stock}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Price & Quantity */}
              <div className="flex justify-between items-center mt-3">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    ₹{qty === 0 ? numericPricePerPc.toFixed(2) : total}
                  </div>
                  {qty > 0 && (
                    <div className="text-xs text-gray-500">
                      at ₹{numericPricePerPc.toFixed(2)}/pc
                    </div>
                  )}
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => updateQuantity(product, 1)}
                    className="bg-white-500 border-2 bg-red-50 text-xs text-red-600 border-red-400  px-4 py-1 rounded-xl  hover:bg-red-600  hover:text-white  hover:border-red-600"
                  >
                    ADD +
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(product, qty - 1)}
                      className="text-lg font-bold text-gray-700 hover:text-red-600"
                    >
                      −
                    </button>
                    <span className="font-semibold text-gray-900">{qty}</span>
                    <button
                      onClick={() => updateQuantity(product, qty + 1)}
                      className="text-lg font-bold text-blue-600 hover:text-blue-700"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced Savings Display */}
              {saved > 0 && (
                <div className="mt-2 bg-green-50 text-green-600 text-xs text-center p-1 rounded-md">
                  You saved ₹{saved} total!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      {products?.length > btnlength && (
        <div className="text-center mt-4">
          <Link href={`/pages/bestseller`}>
            <button className="view-all-btn m-auto">View All</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BestSeller;