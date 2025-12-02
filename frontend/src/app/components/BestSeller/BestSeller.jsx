"use client";
import { useEffect, useRef, useState } from "react";
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

/**
 * BestSeller.jsx
 * - Per-product quantity & price maps (no hooks inside loops)
 * - Uses product.discountTiers if present; otherwise falls back to GLOBAL_DISCOUNT_TIERS
 * - Updates cart (local Redux or API) when quantity > 0
 * - Add / increment / decrement UI identical to FeatureProduct
 */
 // use directly from backend


const BestSeller = ({ productlength = 4, btnlength = 8 }) => {
 
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { cartItems } = useSelector((state) => state.cart);
  const { items: apiCartItems } = useSelector((state) => state.apiCart);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const user = useSelector((state) => state.login.user);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // per-product state stored in maps to avoid Hook ordering issues
  const [quantities, setQuantities] = useState({}); // { [productId]: qty }
  const [pricePerPcMap, setPricePerPcMap] = useState({}); // { [productId]: pricePerPc }

  const cartItemsValue = user?.email ? apiCartItems : cartItems;




  // Get correct price per piece based on product.package
// get price per piece from backend package
const getPricePerPc = (product, qty) => {
  const basePrice = Number(product?.finalPrice);
  const tiers = product?.package || [];

  if (tiers.length === 0) return basePrice;

  const sorted = [...tiers].sort((a, b) => a.stock - b.stock);

  let price = basePrice;
  sorted.forEach((tier) => {
    if (qty >= tier.stock) price = tier.price;
  });

  return price;
};



// Determine active package tier
const getActivePackage = (product, qty) => {
  const tiers = product?.package ?? [];
  const sorted = [...tiers].sort((a, b) => Number(a.stock) - Number(b.stock));

  // 1️⃣ If quantity exactly matches a package tier → that tier becomes active
  const exact = sorted.findIndex(t => Number(t.stock) === qty);
  if (exact !== -1) return exact;

  // 2️⃣ Otherwise find highest matching tier
  let active = null;
  sorted.forEach((tier, index) => {
    if (qty >= Number(tier.stock)) active = index;
  });

  return active;
};


const shouldHidePackage = (product, qty, index) => {
  const activeIndex = getActivePackage(product, qty);
  return activeIndex !== null && index < activeIndex;
};



  useEffect(() => {
    dispatch(verifyUser());

    const fetchBestSellers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/product/get-best-selling-books");
        const fetched = response?.data?.products?.map(p => ({
          ...p,
          package: p.package || [] // ensures frontend always has array
        })) || [];
           
        console.log(fetched)
        setProducts(fetched);
        

        // init per-product maps
        const initialQty = {};
        const initialPrice = {};
        for (const p of fetched) {
          initialQty[p._id] = 0;
          initialPrice[p._id] = p.basePrice ?? p.finalPrice ?? GLOBAL_BASE_PRICE;
        }
        setQuantities(initialQty);
        setPricePerPcMap(initialPrice);
      } catch (err) {
        console.error(err);
        setError("Failed to load Best Seller products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [dispatch]);

  // compute per-product price based on tiers (product-specific or global)
  const computePricePerPc = (product, qty) => {
  
    
    const tiers = product?.discountTiers ?? GLOBAL_DISCOUNT_TIERS;
    // start with product.basePrice or finalPrice fallback
    let price = product?.basePrice ?? product?.finalPrice ?? GLOBAL_BASE_PRICE;
    for (const t of tiers) {
      if (qty >= t.pcs) price = t.pricePerPc;
    }
    return price;
  };

  // update per-product quantity and price map, and sync to cart if qty > 0
  const updateQuantity = (product, newQty) => {
    const qty = Math.max(0, parseInt(newQty || 0, 10));
    const id = product._id;

    setQuantities((prev) => ({ ...prev, [id]: qty }));
    const newPrice = getPricePerPc(product, qty);

    setPricePerPcMap((prev) => ({ ...prev, [id]: newPrice }));

    // sync to cart or API when qty > 0
    if (qty > 0) {
      syncToCart(product, qty);
    } else {
      // if qty is 0 and you want to remove from cart, you can dispatch remove action here
      // (left intentionally blank to mirror FeatureProduct behavior; add removal logic if desired)
    }
  };

  // wrappers for increment / decrement
  const incrementProduct = (product) => {
    const curr = quantities[product._id] || 0;
    updateQuantity(product, curr + 1);
  };
  const decrementProduct = (product) => {
    const curr = quantities[product._id] || 0;
    updateQuantity(product, Math.max(0, curr - 1));
  };

  const updateQtyToPackage = (product, stock) => {
    setQuantities((prev) => ({
      ...prev,
      [product._id]: stock
    }));
  };
  

  // sync to local redux or API cart (keeps your existing behavior)
  const syncToCart = (product, qty) => {
    const exists = user?.email
      ? apiCartItems.some((item) => item.productId?._id === product._id)
      : cartItems.some((item) => item.id === product._id);

    if (!user?.email) {
      const cartItem = {
        id: product._id,
        name: product.title,
        image: product.images?.[0],
        price: product.finalPrice,
        finalPrice: product.finalPrice,
        quantity: qty,
      };
      dispatch(addToCart(cartItem));
      toast.success(exists ? "Quantity updated in your cart!" : `${product.title} added.`);
    } else {
      dispatch(addtoCartState({ id: product._id }));
      dispatch(addToCartAPIThunk({ productId: product._id, quantity: qty }));
      toast.success(exists ? "Quantity updated in your cart!" : `${product.title} added.`);
    }
  };

  // wishlist handler (unchanged)
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

  // Add-to-cart one-off button (keeps previous explicit button behavior)
  const handleAddToCart = async (product) => {
    const qty = quantities[product._id] || 0;
    const finalQty = qty === 0 ? 1 : qty;
  
    const cartItem = {
      id: product._id,
      name: product.title,
      image: product.images[0],
      price: product.price,
      finalPrice: product.finalPrice,
      quantity: finalQty,
    };
  
    if (!user?.email) {
      dispatch(addToCart(cartItem));
    } else {
      dispatch(addtoCartState({ id: product._id }));
      dispatch(addToCartAPIThunk({ productId: product._id, quantity: finalQty }));
    }
  };
  

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse space-y-3 border border-gray-200 rounded-lg shadow p-4">
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
    return <div className="text-center text-gray-500">No best sellers found.</div>;
  }

  const visibleProducts = products.length > productlength ? products.slice(0, productlength) : products;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Best Selling Products</h2>
          <p className="text-sm text-gray-500">Explore our top-selling titles this month at Kthmart</p>
        </div>

        {pathname !== "/pages/bestSellerbook" && (
          <Link href="/pages/bestSellerbook">
            <button className="view-all-btn flex items-center gap-2  text-white px-3 py-1 rounded-full ">
              View All <ArrowRight size={16} />
            </button>
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleProducts.map((product) => {
          const qty = quantities[product._id] || 0;
          const pricePerPc = pricePerPcMap[product._id] ?? (product.basePrice ?? product.finalPrice);

          const totalForQty = (pricePerPc * qty).toFixed(0);

          const tiers = product.discountTiers ?? [];


          const inCart = user?.email
            ? cartItemsValue.some((item) => item.productId?._id === product._id)
            : cartItemsValue.some((item) => item.id === product._id);

          const inWishlist = user?.email
            ? wishlistItems?.some((item) => item._id === product._id)
            : wishlistItems?.some((item) => item.id === product._id);

          return (
            <div key={product._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              {/* Top (image + badges) */}
              <div className="relative p-3">
                {typeof product.discount === "number" && product.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-e-2xl z-10">
                    {product.discount}%
                  </div>
                )}

                <div
                  className="absolute top-3 right-3 bg-white rounded-full p-1 shadow cursor-pointer z-10"
                  onClick={() => handleAddToWishlist(product._id, product.title, product.images?.[0], product.finalPrice, product.oldPrice)}
                >
                  {inWishlist ? "❤️" : <Heart size={16} className="text-gray-700" />}
                </div>

                <Link href={`/pages/shop/${product._id}`}>
                  <div className="w-full h-40 flex justify-center items-center">
                    <Image
                      src={product?.images?.[0] ? `${serverUrl}/public/image/${product.images[0]}` : CallBackImg}
                      alt={product.title}
                      width={240}
                      height={240}
                      className="object-contain h-full"
                    />
                  </div>
                </Link>
              </div>

              {/* Body */}
              <div className="px-4 pb-4">
                <Link href={`/pages/shop/${product._id}`}>
                  <h3 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2">{product.title}</h3>
                  <p className="text-xs text-gray-500 italic line-clamp-1">{product.pages}</p>
                </Link>

                {/* Discount tiers */}
                {/* <div className="mt-3">
  {product?.package?.map((item, index) => {
    const isActive = getActivePackage(product, qty) === index;
    const hide = shouldHidePackage(product, qty, index);

    if (hide) return null;

    return (
      <div
        key={index}
        className={`flex justify-between items-center mt-2 p-2 rounded border 
          ${isActive ? "border-pink-600 bg-pink-50" : "border-gray-300 bg-gray-100"}
        `}
      >
        <p className="text-xs">
          ₹{item.price}/{item.unit} — {item.stock}+ {item.unit}
        </p>

        {isActive && <span className="text-pink-600 font-bold text-lg">✓</span>}

        <button
          onClick={() => updateQuantity(product, item.stock)}
          className="text-pink-600 text-xs font-semibold"
        >
          Add {item.stock}
        </button>
      </div>
    );
  })}
</div> */}



{/* PACKAGE OPTIONS */}
<div className="mt-2">
  {product?.package?.length > 0 ? (
    product.package.map((item, index) => {
      const isActive = getActivePackage(product, qty) === index;
      const hide = shouldHidePackage(product, qty, index);

      if (hide) return null;

      return (
        <div
          key={index}
          className={`flex justify-between items-center mt-2 p-2 rounded border 
            ${isActive ? "border-pink-600 bg-pink-50" : "border-gray-300 bg-gray-100"}`}
        >
          <p className="text-xs">
            ₹{item.price}/{item.unit} — {item.stock}+ {item.unit}
          </p>

          {isActive && <span className="text-pink-600 font-bold text-lg">✓</span>}

          <button
  onClick={() => updateQuantity(product, item.stock)}
  className="text-pink-600 text-xs font-semibold"
>
  Add {item.stock}
</button>

        </div>
      );
    })
  ) : ""}
</div>





                {/* Price + controls */}
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      ₹{qty === 0 ? product.finalPrice : totalForQty}
                    </div>
                    <div className="text-sm text-gray-500">at ₹{Number(pricePerPc).toFixed(2)}/pc</div>
                  </div>

                  {/* Add or counter */}
                  {qty === 0 ? (
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => updateQuantity(product, 1)}
                        className="bg-white-500 border-2 bg-red-50 text-xs text-red-600 border-red-400  px-4 py-1 rounded-xl  hover:bg-red-600  hover:text-white  hover:border-red-600"
                      >
                        ADD +
                      </button>

                      {/* optional: quick add to cart using default qty 1 */}
                      {/* <button
                        onClick={() => handleAddToCartButton(product)}
                        className="text-xs text-gray-600 underline"
                      >
                        Add to cart (1)
                      </button> */}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl">
                      <button
                        onClick={() => updateQuantity(product, qty - 1)}
                        className="px-3 py-1 bg-gray-200 rounded-full text-lg font-bold hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold">{qty}</span>
                      <button
                        onClick={() => updateQuantity(product, qty + 1)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-full text-lg font-bold hover:bg-blue-700"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Saved amount */}
                {qty > 0 && getPricePerPc(product, qty) < product.finalPrice && (
  <div className="mt-3 bg-green-50 p-2 rounded-lg text-center text-green-600 text-sm font-medium">
    You saved ₹
    {((product.finalPrice - getPricePerPc(product, qty)) * qty).toFixed(2)}
    !
  </div>
)}


                  
                {/* old price / added to cart state */}
                {/* <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {typeof product.discount === "number" && product.discount > 0 && (
                      <span className="line-through">₹{product.price}</span>
                    )}
                  </div>

                  <div>
                    <button
                      style={{ cursor: "pointer" }}
                      className={
                        product.stock === 0
                          ? "opacity-60 cursor-not-allowed text-xs px-3 py-1 rounded bg-gray-200"
                          : inCart
                          ? "text-xs px-3 py-1 rounded bg-green-100 text-green-700"
                          : "text-xs px-3 py-1 rounded bg-blue-50 text-blue-700"
                      }
                      onClick={() => handleAddToCartButton(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of Stock" : inCart ? "Added" : "Add to cart"}
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All */}
      {products.length > btnlength && (
        <div className="text-center mt-6">
          <Link href="/pages/bestSellerbook">
            <button className="view-all-btn bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-full transition">
              View All
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BestSeller;
