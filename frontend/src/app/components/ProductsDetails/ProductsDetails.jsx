"use client";

import { useEffect, useState } from "react";
import { Parser } from "html-to-react";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpenText,
  CheckCheck,
  ChevronsLeft,
  Globe,
  Heart,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { addToCart } from "@/app/redux/AddtoCart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance, { serverUrl } from "@/app/redux/features/axiosInstance";
import { useParams, useRouter } from "next/navigation";
import CallBackImg from "../../Images/DBS/DBSLOGO.jpg";

import fastdelivery from "../../Images/DowloadImage/fast-delivery.png";
import bestprice from "../../Images/DowloadImage/best-price.png";
import wide from "../../Images/DowloadImage/Wide.png";
import { Parser } from "html-to-react";
import {
  addToCartAPIThunk,
  addtoCartState,
} from "@/app/redux/AddtoCart/apiCartSlice";
import {
  addToWishlist,
  addToWishlistApi,
  addToWishlistState,
  removeFromWishlist,
  removeFromWishlistApi,
  removeFromWishlistState,
} from "@/app/redux/wishlistSlice";
import ISBNBarcode from "../ISBNBarcode/ISBNBarcode";

export default function ProductDetails() {
  // Api for show ingle prodict data
  const [activeTab, setActiveTab] = useState("details");

  const htmlParser = new Parser();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login.user);
  const { cartItems } = useSelector((state) => state.cart);
  const { items: apiCartItems } = useSelector((state) => state.apiCart);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  console.log("wishlistItems:", wishlistItems);

  // ---------- NEW: Pack selection state & logic ----------
  const [quantity, setQuantity] = useState(1);
  // const pricingOptions = [
  //   { packs: 5, price: 51, saved: 15 },
  //   { packs: 3, price: 52 },
  // ];
  const selectPacks = (packs) => setQuantity(packs);
  const increment = () => setQuantity((n) => n + 1);
  const decrement = () => quantity > 0 && setQuantity((n) => n - 1);

  const getPrice = () => {
    // If user selected packs, apply tiered price
    if (quantity >= 5) return 51;
    if (quantity >= 3) return 52;
    // fallback to book.finalPrice (will be available after book loads)
    return book?.finalPrice ?? 0;
  };
  // ------------------------------------------------------



  const getPricePerPiece = (qty) => {
    if (!book?.package?.length) return book?.finalPrice;
  
    const stocks = book.package.map(p => p.stock);
    const pkgPrice = book.package.map(p => p.price);
    const base = book.finalPrice;
  
    if (qty < stocks[0]) {
      return base;
    } 
    else if (qty >= stocks[0] && qty < stocks[1]) {
      return pkgPrice[0];
    } 
    else if (qty >= stocks[1]) {
      return pkgPrice[1];
    }
  
    return base;
  };
  
  const handleAddToCart = async (product) => {
    const exists = cartItems.some((item) => item.id === product._id);
    const insideApiExists = apiCartItems.some(
      (item) => item.productId?._id === product._id
    );

    const useQty = quantity > 0 ? quantity : 1;
    const priceToUse = getPrice() || product.finalPrice;

    const cartItem = {
      id: product._id,
      name: product.title,
      image: product?.images[0],
      price: priceToUse,
      finalPrice: priceToUse,
      quantity: useQty,
    };

    if (!user && !user?.email) {
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
      dispatch(addToCartAPIThunk({ productId: product._id, quantity: useQty }));
      toast.success(
        insideApiExists
          ? "Quantity updated in your cart!"
          : `Great choice! ${product.title} added.`
      );
    }
  };

  const handleAddToWishlist = (_id, title, images, finalPrice, price) => {
    if (user?.email) {
      const isAlreadyInWishlist = wishlistItems?.some(
        (item) => item._id === _id
      );
      if (isAlreadyInWishlist) {
        dispatch(removeFromWishlistState(_id));
        dispatch(removeFromWishlistApi(_id));
        toast.error("Remove from wishlist.");
      } else {
        dispatch(addToWishlistState({ _id }));
        dispatch(addToWishlistApi({ productId: _id }));
        toast.success(`"${title}" added to wishlist.`);
      }
    } else {
      const isAlreadyInWishlist = wishlistItems?.some((item) => item.id === _id);
      if (isAlreadyInWishlist) {
        dispatch(removeFromWishlist(_id));
        toast.error("removed from wishlist.");
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

  const router = useRouter();

  const handleBuyNow = (product) => {
    handleAddToCart(product);
    router.push("/pages/checkout");
  };
  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: "Check out this product!",
          text: `I found this amazing book on Kthmart`,
          url: window.location.href,
        })
        .then(() => toast.success("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert(
        "Sharing not supported in this browser. You can copy the link manually."
      );
    }
  };

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    if (!id) return;

    const fetchProductDetail = async () => {
      try {
        const response = await axiosInstance.get(`/product/get-product/${id}`);
        setBook(response.data.product);
        console.log("Product data:=>", response?.data?.product?.images);
      } catch (err) {
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!book) {
    return (
      <div className="text-center text-gray-500">
        {loading ? "Loading..." : "Product not found."}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}

      <div className="mb-6">
        <Link
          href="/pages/shop"
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronsLeft />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="space-y-4">
          {/* Main Image */}

          <div className="border border-green-500 rounded-lg overflow-hidden bg-white p-4 flex items-center justify-center h-[440px]">
            <Image
              src={
                book?.images?.[0]
                  ? `${serverUrl}/public/image/${book?.images[0]}`
                  : CallBackImg
              }
              className="h-[415px] object-cover hover:scale-97 rounded-lg transition-transform duration-300"
              width={500}
              height={500}
              alt={book?.title}
              zoom={2}
            />
          </div>
        </div>

        {/* Middle Column - Book Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{book.title}</h1>
              </div>
              <div className="flex space-x-2">
                <button
                  className="p-2 cursor-pointer border border-green-600 rounded-md hover:bg-green-100"
                  onClick={() =>
                    handleAddToWishlist(
                      book._id,
                      book.title,
                      book?.images[0],
                      book.finalPrice,
                      book.oldPrice
                    )
                  }
                >
                  {(
                    user?.email
                      ? wishlistItems?.some((item) => item?._id === book._id)
                      : wishlistItems?.some((item) => item.id === book._id)
                  ) ? (
                    "❤️"
                  ) : (
                    <Heart size={20} />
                  )}
                  <span className="sr-only cursor-pointer">
                    Add to wishlist
                  </span>
                </button>
                <button
                  className="p-2 border cursor-pointer border-green-600 rounded-md hover:bg-green-100"
                  onClick={handleShare}
                >
                  <Share2 />
                  <span className="sr-only">Share</span>
                </button>
              </div>
            </div>
          </div>

          <div className=" rounded-lg overflow-hidden">
            <div className="p-3">
              <div className="">
              <div dangerouslySetInnerHTML={{ __html: book.description }} />
              </div>
            </div>
          </div>
          <hr className="border-green-400" />

          <div>
            {/* ---------- INSERT PACK SELECTION UI HERE (before price) ---------- */}
            <div className="mb-4">
              <div className="border rounded-2xl p-4 space-y-4">
                {/* Savings banner
                {quantity >= 5 && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-xl flex justify-between items-center">
                    <span>{`₹${pricingOptions[0].saved} saved on ${quantity} packs`}</span>
                    <span>✔️</span>
                  </div>
                )} */}

<div className="bg-blue-50 p-3 rounded-xl space-y-2">
  {book?.package?.map((pkg, index) => (
    <div key={index} className="flex justify-between items-center pb-2 border-b last:border-none">
      <div className="text-blue-700">
        ₹{pkg.price}/piece for {pkg.stock}+ pcs
      </div>

      <button
        onClick={() => setQuantity(pkg.stock)}
        className="text-red-500 font-medium px-3 py-1 rounded"
      >
        Add {pkg.stock}
      </button>
    </div>
  ))}
</div>


                {/* Pack options */}
                {/* <div className="bg-blue-50 p-3 rounded-xl space-y-2">
                  {pricingOptions.map((opt) => (
                    <div
                      key={opt.packs}
                      className="flex justify-between items-center pb-2 border-b last:border-none"
                    >
                      <div className="text-blue-700">
                        ₹{opt.price}/pack for {opt.packs}+ packs
                      </div>
                      <button
                        onClick={() => selectPacks(opt.packs)}
                        className={`text-red-500 font-medium px-3 py-1 rounded ${
                          quantity === opt.packs ? "bg-red-50" : ""
                        }`}
                      >
                        Add {opt.packs}
                      </button>
                    </div>
                  ))}
                </div> */}

                {/* Price & quantity controls */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold">
                    ₹{ (quantity * getPricePerPiece(quantity))?.toFixed(0) }

                    </span>
                    <span className="text-gray-400 line-through ml-2">
                      ₹{book.price?.toFixed(0)}
                    </span>
                  </div>

                  {quantity === 0 ? (
                    <button
                      onClick={() => setQuantity(1)}
                      className="border border-red-400 px-6 py-2 rounded-xl text-red-500 font-semibold"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center border border-red-400 rounded-xl overflow-hidden">
                      <button
                        onClick={decrement}
                        className="px-4 py-2 text-red-500 hover:bg-red-50"
                      >
                        -
                      </button>
                      <div className="px-4 py-2 border-l border-r border-red-400">
                        {quantity}
                      </div>
                      <button
                        onClick={increment}
                        className="px-4 py-2 text-red-500 hover:bg-red-50"
                      >
                        +
                      </button>

                      
                    </div>
                    
                  )}
                       <hr />
<div className="text-sm text-gray-500">
  ₹{getPricePerPiece(quantity)} per piece
</div>

                </div>
              </div>
            </div>
            {/* ---------- END PACK UI ---------- */}

            <div>
              <div className="flex items-center gap-2">
                prices:{" "}
                <span className="text-2xl  text-green-600 font-bold">
                  ₹{book.finalPrice?.toFixed()}
                </span>
                <span className="font-medium line-through">
                  ₹{book.price?.toFixed()}
                </span>
              </div>
              <span className="text-[12px] text-red-700">
                (Inclusive of all taxes)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3"></div>

            {book?.stock === 0 && (
              <div className="w-full flex items-center gap-2 p-3 text-sm text-white bg-gradient-to-r from-red-600 to-red-500 rounded shadow-sm">
                <i className="fa-solid fa-ban text-white"></i>
                <span>Sorry! This book is currently out of stock.</span>
              </div>
            )}
          </div>

          {book?.stock > 0 && (
            <div className="flex flex-col space-y-3">
              <button
                className={`${
                  cartItems.some((item) => item.id === book.id)
                    ? "w-full bg-black text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center cursor-pointer"
                    : "w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                }`}
                onClick={() => handleAddToCart(book)}
              >
                {cartItems.some((item) => item.id === book.id) ? (
                  <>
                    <span className="flex cursor-pointer">
                      Added to cart <CheckCheck />
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex cursor-pointer">
                      <ShoppingCart /> Add to cart
                    </div>
                  </>
                )}
              </button>

              <button
                className="cursor-pointer w-full border border-gray-500 hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-md transition-colors"
                onClick={() => handleBuyNow(book)}
              >
                Buy Now
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Description and QR Code */}
        <div className="space-y-6">
          <div>
            <div className="flex border-b border-green-700">
              <button
                className="px-4 py-2 font-medium text-sm text-black hover:green"
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
            </div>

            <div className="mt-4">
              {activeTab === "details" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                    {book?.details && (
  <div className="text-sm leading-relaxed">
{book?.details && (
  <div className="text-sm leading-relaxed">
  {htmlParser.parse(
    book.details

      // 1️⃣ Kill vendor-prefixed props BEFORE React sees them
      .replace(/webkitTextStrokeWidth|WebkitTextStrokeWidth/gi, '')

      // 2️⃣ Prevent React from parsing inline styles (critical fix)
      .replace(/style="/g, 'data-style="')

      // 3️⃣ Convert camelCase to normal CSS inside data-style
      .replace(/data-style="([^"]*)"/g, (m, styles) => {
        const fixed = styles
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .toLowerCase();
        return `style="${fixed}"`;
      })
  )}
</div>

)}

  </div>
)}

                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 w-full">
        <h3 className="font-bold text-xl mb-6">Why shop from Kthmart?</h3>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-4 w-full">
            <Image
              src={fastdelivery}
              alt="Superfast Delivery"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h4 className="font-semibold text-sm">Superfast Delivery</h4>
              <p className="text-sm text-gray-600">
                Get your order delivered to your doorstep at the earliest from dark
                stores near you.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 w-full">
            <Image
              src={bestprice}
              alt="Best Prices & Offers"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h4 className="font-semibold text-sm">Best Prices & Offers</h4>
              <p className="text-sm text-gray-600">
                Best price destination with offers directly from the manufacturers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 w-full">
            <Image src={wide} alt="Wide Assortment" className="w-12 h-12 object-contain" />
            <div>
              <h4 className="font-semibold text-sm">Wide Assortment</h4>
              <p className="text-sm text-gray-600">
                Choose from 5000+ products across food, personal care, household &
                other categories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
