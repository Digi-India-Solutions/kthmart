"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/app/redux/AddtoCart/cartSlice";
import {
  addToWishlist,
  addToWishlistApi,
  addToWishlistState,
  removeFromWishlist,
  removeFromWishlistApi,
  removeFromWishlistState,
} from "@/app/redux/wishlistSlice";
import axiosInstance, { serverUrl } from "@/app/redux/features/axiosInstance";
import {
  addToCartAPIThunk,
  addtoCartState,
} from "@/app/redux/AddtoCart/apiCartSlice";
import CallBackImg from "../../Images/DBS/DBSLOGO.jpg";
import { verifyUser } from "@/app/redux/features/auth/loginSlice";

const NewArrival = () => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { items: apiCartItems } = useSelector((state) => state.apiCart);
  const user = useSelector((state) => state.login.user);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);

  const swiperRef = useRef(null);

  // products fetched from API
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // per-product state maps:
  const [quantities, setQuantities] = useState({});
  const [pricePerPcMap, setPricePerPcMap] = useState({});

  // If user is logged in we use apiCartItems else local cartItems 
  let cartItemsValue = [];
  if (user?.email) {
    cartItemsValue = apiCartItems;
  } else {
    cartItemsValue = cartItems;
  }

  useEffect(() => {
    dispatch(verifyUser());
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

  // fetch products
  useEffect(() => {
    const newArrivals = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/product/get-new-arrival");
        const fetched = response?.data?.products || [];
        setProducts(fetched);

        // initialize per-product maps
        const initialQuantities = {};
        const initialPriceMap = {};
        for (const p of fetched) {
          initialQuantities[p._id] = 0;
          initialPriceMap[p._id] = Number(p.finalPrice) || 26.56;
        }
        setQuantities(initialQuantities);
        setPricePerPcMap(initialPriceMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load New Arrival product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    newArrivals();
  }, []);

  // 💡 UPDATED: Handles all cart updates and price recalculations
  const updateQuantity = (product, newQty) => {
    const tierPrice = getPricePerPc(product, newQty);

    setQuantities((prev) => ({ ...prev, [product._id]: newQty }));
    setPricePerPcMap((prev) => ({ ...prev, [product._id]: tierPrice }));

    if (newQty > 0) handleCartUpdate(product, newQty);
  };

  // increment & decrement wrappers
  const incrementProduct = (product) => {
    const curr = quantities[product._id] || 0;
    updateQuantity(product, curr + 1);
  };
  
  const decrementProduct = (product) => {
    const curr = quantities[product._id] || 0;
    updateQuantity(product, Math.max(0, curr - 1));
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

  // Add to cart handler (for quick add button)
  const handleAddToCart = async (product, qtyToAdd = 1) => {
    const exists = cartItems.some((item) => item.id === product._id);
    const insideApiExists = apiCartItems.some(
      (item) => item.productId?._id === product._id
    );

    const cartItem = {
      id: product._id,
      name: product.title,
      image: product.images[0],
      price: product.finalPrice,
      finalPrice: product.finalPrice,
      quantity: qtyToAdd,
    };

    if (!user?.email) {
      try {
        await dispatch(addToCart(cartItem));
        toast.success(
          exists
            ? "Quantity updated in your cart!"
            : `Great choice! ${product.title} added.`
        );
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
        console.error("Cart error:", error);
      }
    } else {
      dispatch(addtoCartState({ id: product._id }));
      dispatch(addToCartAPIThunk({ productId: product._id, quantity: qtyToAdd }));
      toast.success(
        insideApiExists
          ? "Quantity updated in your cart!"
          : `Great choice! ${product.title} added.`
      );
    }
  };

  // wishlist logic
  const handleAddToWishlist = (_id, title, images, finalPrice, price) => {
    if (user?.email) {
      const isAlreadyInWishlist = wishlistItems.some((item) => item._id === _id);
      if (isAlreadyInWishlist) {
        dispatch(removeFromWishlistState(_id));
        dispatch(removeFromWishlistApi(_id));
        toast.error("Removed from wishlist.");
      } else {
        dispatch(addToWishlistState({ _id }));
        dispatch(addToWishlistApi({ productId: _id }));
        toast.success(`"${title}" added to wishlist.`);
      }
    } else {
      const isAlreadyInWishlist = wishlistItems?.some((item) => item.id === _id);
      if (isAlreadyInWishlist) {
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

  // loading & error UI
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

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500">
        {loading ? "Loading..." : "Product not found."}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">New Arrival products</h2>
      </div>

      <div
        onMouseEnter={() => swiperRef.current?.swiper.autoplay.stop()}
        onMouseLeave={() => swiperRef.current?.swiper.autoplay.start()}
      >
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Autoplay]}
          spaceBetween={12}
          navigation
          loop={true}
          autoplay={{ delay: 2200, disableOnInteraction: false }}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
        >
          {products.map((product) => {
            // per product state values
            const productQty = quantities[product._id] || 0;
            const productPricePerPc = getPricePerPc(product, productQty);
            const total = (productQty * productPricePerPc).toFixed(2);
            const basePrice = Number(product?.finalPrice) || 26.56;
            
            // FIXED: Ensure numbers for calculations
            const numericPricePerPc = Number(productPricePerPc);
            const numericBasePrice = Number(basePrice);
            
            // Calculate savings
            const saved = productQty > 0 && numericPricePerPc < numericBasePrice
              ? ((numericBasePrice - numericPricePerPc) * productQty).toFixed(2)
              : 0;

            const isInCart = user?.email
              ? apiCartItems.some(
                (item) => item?.productId?._id === product._id
              )
              : cartItems.some((item) => item.id === product._id);

            return (
              <SwiperSlide key={product._id}>
                <div className="border border-gray-300 p-3 rounded-xl relative bg-white hover:shadow-lg transition-all duration-200">
                  {/* discount badge */}
                  {typeof product.discount === "number" && product.discount > 0 && (
                    <div className="absolute top-2 left-0 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-e-2xl z-10">
                      {product.discount}%
                    </div>
                  )}

                  {/* wishlist toggle */}
                  <div
                    className="absolute top-2 right-3 shadow-md rounded-full p-1 bg-white hover:bg-gray-100 cursor-pointer"
                    onClick={() =>
                      handleAddToWishlist(
                        product._id,
                        product.title,
                        product.images?.[0],
                        product.finalPrice,
                        product.oldPrice
                      )
                    }
                  >
                    {(
                      user?.email
                        ? wishlistItems?.some((item) => item?._id === product._id)
                        : wishlistItems?.some((item) => item.id === product._id)
                    ) ? (
                      "❤️"
                    ) : (
                      <Heart size={16} className="text-gray-700" />
                    )}
                  </div>

                  {/* image */}
                  <Link href={`/pages/shop/${product._id}`}>
                    <div className="w-full h-48 flex justify-center items-center mb-2">
                      <Image
                        src={
                          product?.images?.[0]
                            ? `${serverUrl}/public/image/${product.images[0]}`
                            : CallBackImg
                        }
                        width={300}
                        height={300}
                        alt={product.title}
                        className="object-contain h-[70%]"
                      />
                    </div>
                  </Link>

                  {/* title & subtitle */}
                  <Link href={`/pages/shop/${product._id}`}>
                    <h3 className="text-sm md:text-base font-semibold line-clamp-1 text-gray-800">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500 italic line-clamp-1">
                      {product.pages}
                    </p>
                  </Link>

                  {/* NEW: Package Tiers with Hide/Show Logic */}
                  <div className="mt-2 space-y-1">
                    {product?.package?.map((item, index) => {
                      const isActive = getActivePackage(product, productQty) === index;
                      const hide = shouldHidePackage(product, productQty, index);

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
                            ₹{Number(item.price).toFixed(2)}/{item.unit} — {item.stock}+
                          </p>

                          {isActive && <span className="text-pink-600 font-bold">✓</span>}

                          {!isActive && (
                            <button
                              onClick={() => {
                                updateQuantity(product, Number(item.stock));
                              }}
                              className="text-pink-600 text-xs font-semibold"
                            >
                              Add {item.stock}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Price + Add/Quantity */}
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        ₹{productQty === 0 ? numericPricePerPc.toFixed(2) : total}
                      </div>
                      {productQty > 0 && (
                        <div className="text-xs text-gray-500">
                          at ₹{numericPricePerPc.toFixed(2)}/pc
                        </div>
                      )}
                    </div>

                    {/* Add button or quantity selector */}
                    {productQty === 0 ? (
                      <button
                        onClick={() => incrementProduct(product)}
                        className="bg-white-500 border-2 bg-red-50 text-xs text-red-600 border-red-400  px-4 py-1 rounded-xl  hover:bg-red-600  hover:text-white  hover:border-red-600"
                      >
                        ADD +
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl">
                        <button
                          onClick={() => decrementProduct(product)}
                          className="px-2 text-lg font-bold text-gray-700 hover:text-red-600"
                        >
                          −
                        </button>
                        <span className="font-semibold text-gray-900 text-lg">
                          {productQty}
                        </span>
                        <button
                          onClick={() => incrementProduct(product)}
                          className="px-2 text-lg font-bold text-blue-600 hover:text-blue-700"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  {/* NEW: Enhanced Savings Display */}
                  {saved > 0 && (
                    <div className="mt-2 bg-green-50 text-green-600 text-xs text-center p-1 rounded-md">
                      You saved ₹{saved} total!
                    </div>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default NewArrival;   