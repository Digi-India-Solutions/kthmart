"use client";
import React, { useEffect, useRef, useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
  applyCoupon,
  calculateTotalsLoad,
  removeFromCart,
  setApplyCoupon,
  updateCartState,
  updateQuantity,
} from "@/app/redux/AddtoCart/cartSlice";
import {
  addToCartAPIThunk,
  getAllCartItemsAPI,
  removeFromCartAPI,
  removeFromCartState,
} from "@/app/redux/AddtoCart/apiCartSlice";
import axiosInstance, { debounce, serverUrl } from "@/app/redux/features/axiosInstance";
import { useRouter } from "next/navigation";
import EmptyWishlist from "../../Images/DowloadImage/EmptyCart.png";
import CallBackImg from "../../Images/DBS/DBSLOGO.jpg";

export default function Cart() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { cartItems, totalAmount, tax, discountAmount, total, couponCode } = useSelector((state) => state.cart);
  const { items } = useSelector((state) => state.apiCart);
  const { coupons } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.login);

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [hasOutOfStockItems, setHasOutOfStockItems] = useState(false);
  const [couponCodeInput, setCouponCode] = useState("");

  let cartItemsValue = user?.email ? items : cartItems;

  const debouncedUpdateAPI = useRef(
    debounce((id, quantity) => {
      dispatch(addToCartAPIThunk({ productId: id, quantity }));
    }, 500)
  ).current;

  // Quantity handlers
  const handleRemoveItem = (item) => {
    if (item.quantity > 1) {
      user?.email
        ? dispatch(addToCartAPIThunk({ productId: item.productId._id, quantity: -1 }))
        : dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  const handleAddItem = (item) => {
    user?.email
      ? dispatch(addToCartAPIThunk({ productId: item.productId._id, quantity: 1 }))
      : dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
  };

  const handleDeleteProduct = (id) => {
    user?.email
      ? (dispatch(removeFromCartState(id)), dispatch(removeFromCartAPI(id)))
      : dispatch(removeFromCart(id));
    toast.error("Product removed from cart");
  };

  // Totals
  const subtotal = cartItemsValue.reduce((acc, item) => {
    const price = item?.price ?? item?.productId?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const discountAmountValue = cartItemsValue.reduce((acc, item) => {
    const price = item?.price ?? item?.productId?.price ?? 0;
    const final = item?.finalPrice ?? item?.productId?.finalPrice ?? price;
    return acc + (price - final) * item.quantity;
  }, 0);

  const shippingCost = 0;
  const baseAmount = subtotal - discountAmountValue;
  const adjustedCouponDiscount = couponDiscount < 100 ? (baseAmount * couponDiscount) / 100 : couponDiscount;
  const finalTotal = baseAmount + shippingCost - adjustedCouponDiscount;

  const handleHasOutOfStockItems = () => {
    const itemsOut = cartItemsValue.some((item) =>
      user?.email ? item?.productId?.stock === 0 : item.isOutOfStock
    );
    setHasOutOfStockItems(itemsOut);
  };

  useEffect(() => {
    dispatch(calculateTotalsLoad());
    dispatch(getAllCartItemsAPI());
  }, [dispatch, cartItems]);

  useEffect(() => {
    handleHasOutOfStockItems();
  }, [cartItemsValue]);

  useEffect(() => {
    const cartFromLocal = JSON.parse(localStorage.getItem("cart")) || [];
    const fetchLatestProducts = async () => {
      try {
        const productIds = cartFromLocal.map((item) => item.id);
        const res = await axiosInstance.post("/product/get-multiple-products-by-id", { productIds });
        const latestProducts = res?.data?.products;
        const mergedCart = cartFromLocal.map((item) => {
          const productInfo = latestProducts.find((p) => p._id === item.id);
          return { ...item, isOutOfStock: productInfo?.stock === 0 };
        });
        dispatch(updateCartState(mergedCart));
      } catch (err) {
        console.error("Error syncing cart:", err);
      }
    };
    fetchLatestProducts();
  }, []);

  const handleCheckout = () => {
    if (!user?.email) {
      toast.error("Please login to proceed to checkout.");
      router.push("/pages/login");
      return;
    }
    router.push("/pages/checkout");
  };

  if (cartItemsValue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Image src={EmptyWishlist} alt="Empty Cart" className="w-60 h-60 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm mt-1">Start exploring and add items you love!</p>
        <Link href="/" className="mt-4 inline-block px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center md:text-left">
        🛒 Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="hidden md:grid grid-cols-5 text-sm font-semibold text-gray-500 border-b pb-3 mb-4">
            <div>Image</div>
            <div>Product</div>
            <div className="text-center">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-right">Total</div>
          </div>

          <div className="space-y-4">
            {cartItemsValue.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 md:grid-cols-5 items-center gap-4 border-b pb-4"
              >
                {/* Image */}
                <Link href={`/pages/shop/${item?.productId?._id ?? item?.id}`}>
                  <Image
                    src={
                      item?.image
                        ? `${serverUrl}/public/image/${item.image}`
                        : item?.productId?.images?.[0]
                        ? `${serverUrl}/public/image/${item.productId.images[0]}`
                        : CallBackImg
                    }
                    alt="Product"
                    width={70}
                    height={70}
                    className="rounded-lg object-contain mx-auto"
                  />
                </Link>

                {/* Title */}
                <div className="text-gray-800 font-medium text-sm">
                  {(item?.name ?? item?.productId?.title)?.length > 25
                    ? (item?.name ?? item?.productId?.title).slice(0, 25) + "..."
                    : item?.name ?? item?.productId?.title}
                  {item?.isOutOfStock || item?.productId?.stock === 0 ? (
                    <p className="text-red-500 text-xs mt-1">Out of Stock</p>
                  ) : null}
                </div>

                {/* Price */}
                <div className="text-center text-gray-600 font-semibold">
                  ₹{item?.finalPrice ?? item?.productId?.finalPrice}
                </div>

                {/* Quantity */}
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    readOnly
                    className="w-10 text-center border rounded"
                  />
                  <button
                    onClick={() => handleAddItem(item)}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Total + Delete */}
                <div className="text-right flex justify-end items-center space-x-2 font-semibold text-gray-700">
                  <span>₹{(item?.finalPrice ?? item?.productId?.finalPrice) * item.quantity}</span>
                  <button
                    onClick={() => handleDeleteProduct(item?.id ?? item?.productId?._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 h-fit">
          <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>

          <div className="text-sm space-y-2 text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{shippingCost}</span></div>
            {discountAmountValue > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>-₹{discountAmountValue.toFixed(2)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Coupon</span>
                <span>
                  -{couponDiscount > 100 ? "₹" : ""}
                  {couponDiscount}
                  {couponDiscount < 100 ? "%" : ""}
                </span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{Math.floor(finalTotal)}</span>
            </div>
          </div>

          {/* Coupon Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const coupon = coupons.find((c) => c.couponCode === couponCodeInput);
              if (!coupon) return toast.error("Invalid coupon code");
              if (coupon.minAmount > finalTotal)
                return toast.error(`Minimum spend ₹${coupon.minAmount}`);
              if (coupon.maxAmount < finalTotal)
                return toast.error(`Maximum spend ₹${coupon.maxAmount}`);

              setCouponDiscount(coupon.discount);
              dispatch(setApplyCoupon({ couponCode: coupon.couponCode, discount: coupon.discount }));
              toast.success("Coupon applied successfully!");
            }}
            className="space-y-3 pt-4 border-t"
          >
            <label className="text-sm font-medium text-gray-700">Coupon Code</label>
            <input
              type="text"
              placeholder="Enter code"
              value={couponCodeInput}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              type="submit"
              className="w-full bg-black text-white rounded py-2 hover:bg-gray-800"
              disabled={!couponCodeInput.trim()}
            >
              Apply Coupon
            </button>
          </form>

          <button
            className={`w-full text-white py-3 rounded-lg text-lg font-semibold transition ${
              hasOutOfStockItems
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
            disabled={hasOutOfStockItems}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>

          <p className="text-center text-xs text-gray-500">🔒 Secure checkout powered by Kthmart</p>
        </div>
      </div>
    </div>
  );
}
