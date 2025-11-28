// "use client";
// import React, { useEffect, useMemo } from "react";
// import { Heart } from "lucide-react";
// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import toast from "react-hot-toast";
// import { addToCart } from "@/app/redux/AddtoCart/cartSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "next/navigation";
// // import ShopBanner from "@/app/components/Shop/ShopBanner";
// // import book1 from "../../../../Images/DBS/1.jpg";
// import { fetchProductsByCategory } from "@/app/redux/features/productByCategory/productByCategorySlice";
// import {
//   addToCartAPIThunk,
//   addtoCartState,
// } from "@/app/redux/AddtoCart/apiCartSlice";
// import {
//   addToWishlist,
//   addToWishlistApi,
//   addToWishlistState,
//   removeFromWishlist,
//   removeFromWishlistApi,
//   removeFromWishlistState,
// } from "@/app/redux/wishlistSlice";
// import axiosInstance, { serverUrl } from "@/app/redux/features/axiosInstance";
// import CallBackImg from "../../../../Images/DBS/DBSLOGO.jpg";
// import Sidebar from "@/app/components/SideBar/SideBar";
// // import FilterBar from "@/app/components/FilterBar/FilterBar";
// import FilterCategories from "@/app/components/FilterCategories/FilterCategories";


// const Page = () => {
//   const dispatch = useDispatch();
//   const { id: subcategoryId } = useParams();
//   const { cartItems } = useSelector((state) => state.cart);
//   const { items: apiCartItems } = useSelector((state) => state.apiCart);

//   const [selectedCategoryId, setSelectedCategoryId] = useState(subcategoryId || null);
//   const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
//   console.log("id=>>", subcategoryId, selectedCategoryId)

//   const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
//   const user = useSelector((state) => state.login.user);
//   const { products, loading, error } = useSelector(
//     (state) => state.productByCategory
//   );

//   const [allProducts, setAllProducts] = useState(products || [])


//   console.log("subcategoryId:", subcategoryId);

//   let cartItemsValue = [];
//   if (user?.email) {
//     cartItemsValue = apiCartItems;
//   } else {
//     cartItemsValue = cartItems;
//   }
//   useEffect(() => {
//     if (selectedSubcategoryId) {
//       dispatch(fetchProductsByCategory(selectedSubcategoryId));
//     } else {
//       fetchAllProducts(subcategoryId);
//     }
//   }, [dispatch, selectedSubcategoryId, subcategoryId]);

//   const fetchAllProducts = async (subcategoryId) => {
//     try {
//       const response = await axiosInstance.get(`/product/product-by-main-category/${subcategoryId}`);
//       if (response.status === 200) {
//         setAllProducts(response?.data?.products)
//       }
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
//         {Array.from({ length: 8 }).map((_, index) => (
//           <div
//             key={index}
//             className="animate-pulse space-y-2 rounded-lg border border-gray-200 p-4 shadow"
//           >
//             <div className="h-32 bg-gray-300 rounded-md"></div>
//             <div className="h-4 bg-gray-300 rounded w-3/4"></div>
//             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-6 text-red-500">
//         Error loading Product By SubCategory
//       </div>
//     );
//   }
//   const handleAddToCart = async (product) => {
//     const exists = cartItems.some((item) => item.id === product._id);
//     const insideApiExists = apiCartItems.some(
//       (item) => item.productId?._id === product._id
//     );

//     const cartItem = {
//       id: product._id,
//       name: product.title,
//       image: product.images[0],
//       price: product.price,
//       finalPrice: product.finalPrice,
//       quantity: 1,
//     };

//     if (!user && !user?.email) {
//       try {
//         await dispatch(addToCart(cartItem));

//         toast.success(
//           exists
//             ? "Quantity updated in your cart!"
//             : `Great choice! ${product.title} added.`
//         );
//       } catch (error) {
//         toast.error("Something went wrong. Please try again.");
//         console.error("Cart error:", error);
//       }
//     } else {
//       dispatch(addtoCartState({ id: product._id }));
//       dispatch(addToCartAPIThunk({ productId: product._id, quantity: 1 }));
//       toast.success(
//         insideApiExists
//           ? "Quantity updated in your cart!"
//           : `Great choice! ${product.title} added.`
//       );
//     }
//   };

//   const handleAddToWishlist = (_id, title, images, finalPrice, price) => {
//     if (user?.email) {
//       const isAlreadyInWishlist = wishlistItems?.some(
//         (item) => item._id === _id
//       );
//       if (isAlreadyInWishlist) {
//         dispatch(removeFromWishlistState(_id));
//         dispatch(removeFromWishlistApi(_id));
//         toast.error("Remove from wishlist.");
//       } else {
//         dispatch(addToWishlistState({ _id }));
//         dispatch(addToWishlistApi({ productId: _id }));
//         toast.success(`"${title}" added to wishlist.`);
//       }
//     } else {
//       const isAlreadyInWishlist = wishlistItems?.some(
//         (item) => item.id === _id
//       );
//       if (isAlreadyInWishlist) {
//         dispatch(removeFromWishlist(_id));
//         toast.error("removed from wishlist.");
//       } else {
//         dispatch(
//           addToWishlist({
//             id: _id,
//             name: title,
//             image: images,
//             price: finalPrice,
//             oldPrice: price,
//           })
//         );
//         toast.success(`"${title}" added to wishlist.`);
//       }
//     }
//   };

//   const displayProducts = useMemo(
//     () => (products?.length > 0 ? products : allProducts),
//     [products, allProducts]
//   );

//   return (
//     <>


//       <div className="max-w-7xl mx-auto px-4 py-8 mt-20 ">
//         <div className="flex justify-center ">
//           {/* <FilterBar/> */}
//         </div>
//         {/* <FilterCategories/> */}
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//           {/* Sidebar - col-md-4 */}
//           <aside className="md:col-span-4 lg:col-span-3">
//             <Sidebar
//               categoryId={selectedCategoryId}
//               onSubcategorySelect={(id) => setSelectedSubcategoryId(id)}
//             />
//           </aside>

//           <main className="md:col-span-8 lg:col-span-9">
//             <FilterCategories
//               subcategoryId={subcategoryId}
//               onCategorySelect={(cat) => setSelectedCategoryId(cat?._id)}
//             />


//             {displayProducts?.length === 0 ? (
//               <div className="text-center py-10 text-gray-500">
//                 No products found.
//               </div>
//             ) : (
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2">
//                 {displayProducts?.map((product) => (
//                   <div
//                     key={product?._id}
//                     className="border border-gray-200 bg-white rounded-lg p-3 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
//                   >
//                     {/* Image & Wishlist */}
//                     <div className="relative">
//                       {/* Discount badge */}
//                       {typeof product.discount === "number" && product.discount > 0 && (
//                         <div className="absolute top-2 left-0 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-e-2xl z-10">
//                           {product.discount}%
//                         </div>
//                       )}

//                       {/* Wishlist icon */}
//                       <div
//                         className="bg-white text-black absolute top-2 right-3 shadow-md rounded-2xl p-1 cursor-pointer hover:scale-105 transition"
//                         onClick={() =>
//                           handleAddToWishlist(
//                             product._id,
//                             product.title,
//                             product.img,
//                             product.finalPrice,
//                             product.oldPrice
//                           )
//                         }
//                       >
//                         {(
//                           user?.email
//                             ? wishlistItems?.some((item) => item?._id === product._id)
//                             : wishlistItems?.some((item) => item.id === product._id)
//                         )
//                           ? "❤️"
//                           : <Heart size={16} />}
//                       </div>

//                       {/* Product Image */}
//                       <Link href={`/pages/shop/${product._id}`}>
//                         <div className="w-full h-40 sm:h-44 md:h-48 flex justify-center items-center overflow-hidden bg-white rounded">
//                           <Image
//                             src={
//                               product.images[0]
//                                 ? `${serverUrl}/public/image/${product.images[0]}`
//                                 : CallBackImg
//                             }
//                             alt={product.title}
//                             width={150}
//                             height={150}
//                             className="object-contain h-full transition-transform duration-200 hover:scale-105"
//                           />
//                         </div>
//                       </Link>
//                     </div>

//                     {/* Product Content */}
//                     <div className="mt-2 flex flex-col flex-grow justify-between">
//                       <Link href={`/pages/shop/${product._id}`}>
//                         <h3 className="mt-2 text-sm md:text-base font-medium line-clamp-1">
//                           {product.title}
//                         </h3>
//                         <h3 className="mt-1 text-xs sm:text-sm text-gray-700 italic underline line-clamp-1">
//                           {product.pages}
//                         </h3>
//                       </Link>

//                       <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
//                         {
//                           new DOMParser().parseFromString(
//                             product.description || "",
//                             "text/html"
//                           ).body.textContent
//                         }
//                       </p>

//                       <div className="flex gap-2 mt-4 bg-gray-200 p-1 rounded">
//                         <p className="text-xs text-[11px]   sm:text-sm ">₹213/pack for 9 packs+</p> <span className="text-green-600 sm:text-sm">Add 9</span>
//                       </div>

//                       <div className="flex gap-2 justify-between mt-4 bg-gray-200 p-1 rounded">
//                         <p className="text-xs sm:text-sm ">₹416/kg for 6 kgs+</p> <span className="text-green-600 sm:text-sm">Add 6</span>
//                       </div>

//                       <div className="flex items-baseline gap-2 mt-2">
//                         <div className="text-base md:text-lg font-bold text-red-500">
//                           ₹{product.finalPrice}
//                         </div>
//                         {typeof product.discount === "number" &&
//                           product.discount > 0 && (
//                             <div className="text-xs md:text-sm text-gray-500 line-through">
//                               ₹ {product.price}
//                             </div>
//                           )}
//                       </div>

//                       <button
//                         className={`mt-3 text-xs sm:text-sm font-semibold py-2 px-3 rounded-lg transition-all ${(
//                           user?.email
//                             ? cartItemsValue.some(
//                               (item) => item?.productId?._id === product._id
//                             )
//                             : cartItemsValue.some((item) => item.id === product._id)
//                         )
//                           ? "bg-green-600 text-white hover:bg-green-700"
//                           : "bg-gray-600 text-white hover:bg-gray-700"
//                           }`}
//                         onClick={() => handleAddToCart(product)}
//                       >
//                         {(
//                           user?.email
//                             ? cartItemsValue.some(
//                               (item) => item?.productId?._id === product._id
//                             )
//                             : cartItemsValue.some((item) => item.id === product._id)
//                         )
//                           ? "Added"
//                           : "Add to cart 🛒"}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>

//     </>
//   );
// };
     
// export default Page;

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";

import { addToCart } from "@/app/redux/AddtoCart/cartSlice";
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
import { fetchProductsByCategory } from "@/app/redux/features/productByCategory/productByCategorySlice";
import axiosInstance, { serverUrl } from "@/app/redux/features/axiosInstance";

import Sidebar from "@/app/components/SideBar/SideBar";
import FilterCategories from "@/app/components/FilterCategories/FilterCategories";
import CallBackImg from "../../../../Images/DBS/DBSLOGO.jpg";

const Page = () => {
  const dispatch = useDispatch();
  const { id: subcategoryId } = useParams();

  const { cartItems } = useSelector((state) => state.cart);
  const { items: apiCartItems } = useSelector((state) => state.apiCart);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const user = useSelector((state) => state.login.user);
  const { products, loading, error } = useSelector(
    (state) => state.productByCategory
  );
  

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    subcategoryId || null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); // 🧩 quantity per product

  const cartItemsValue = user?.email ? apiCartItems : cartItems;

  // 🧩 Fetching products
  useEffect(() => {
    if (selectedSubcategoryId) {
      dispatch(fetchProductsByCategory(selectedSubcategoryId));
    } else {
      fetchAllProducts(subcategoryId);
    }
  }, [dispatch, selectedSubcategoryId, subcategoryId]);

  const fetchAllProducts = async (subcategoryId) => {
    try {
      const response = await axiosInstance.get(
        `/product/product-by-main-category/${subcategoryId}`
      );

      
      if (response.status === 200) {
        setAllProducts(response?.data?.products || []);
      }
    } catch (error) {
      console.error("Error fetching main category:", error);
    }
  };

  // 🧩 Dynamic discount tiers
  const getDiscountTiers = (product) => {
    console.log("SSSSSSS::=>", product)
    return product?.package || [];
  };

  // 🧩 Get price per piece dynamically
  // const getPricePerPc = (product, qty ,unit) => {
  //   const base = product?.finalPrice || 26.56;
  //   const stocks = product?.package?.map(item => item.stock) ?? [];
  //   const pkgPrice = product?.package?.map(item => item.price) ?? [];
  //   //  console.log(pkgPrice) 
  //   // console.log(stocks);
     
    
  //   if(qty< stocks[0]) {
  //     return basePrice
  //   }
  //  else if ( qty>= stocks[0] && qty< stocks[1] ){
  //   return pkgPrice[0];
  //  }
  //  else if ( qty>= stoks[1]){
  //   return pkgPrice[1]
  //  }
    

  //   const tiers = getDiscountTiers(product);
    
  //   let price = base;
  //   for (const tier of tiers) {
  //     if (qty >= tier.pcs) price = tier.pricePerPc;
  //   }
  //   return price;
  // };

  const getPricePerPc = (product, qty) => {
    const basePrice = Number(product?.finalPrice);
    const tiers = product?.package || [];
  
    if (tiers.length === 0) return basePrice;
  
    // Sort tiers by stock ascending
    const sorted = [...tiers].sort((a, b) => a.stock - b.stock);
  
    let price = basePrice;
  
    sorted.forEach((tier) => {
      if (qty >= tier.stock) price = tier.price;
    });
  
    return price;
  };
  
  
  // const getActivePackage = (product, qty) => {
  //   const tiers = product?.package ?? [];
  
  //   if (tiers.length === 0) return null;
  
  //   if (qty >= tiers[1].stock) return 1;
  //   if (qty >= tiers[0].stock) return 0;
  
  //   return null; // no package active
  // };
  

  const getActivePackage = (product, qty) => {
    const tiers = product?.package ?? [];
  
    // Sort tiers by stock just in case
    const sorted = [...tiers].sort((a, b) => a.stock - b.stock);
  
    let active = null;
  
    sorted.forEach((tier, index) => {
      if (qty >= tier.stock) active = index;
    });
  
    return active;
  };
  


  const shouldHidePackage = (product, qty, index) => {
    const activeIndex = getActivePackage(product, qty);
  
    // If a package is active → hide all lower ones
    if (activeIndex !== null && index < activeIndex) return true;
  
    return false;
  };
  






  // 🧩 Quantity controls
  const handleQtyChange = (productId, value) => {
    const qty = Math.max(0, parseInt(value || 0, 10));
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const incrementQty = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const decrementQty = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };

  // 🧩 Cart logic
  const handleAddToCart = async (product) => {
    const qty = quantities[product._id] || 0;
  
    // ⭐ If qty is 0 → set to 1 so UI switches to (- 1 +)
    if (qty === 0) {
      setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    }
  
    const finalQty = qty === 0 ? 1 : qty;
  
    const isInLocalCart = cartItems.some((item) => item.id === product._id);
    const isInApiCart = apiCartItems.some(
      (item) => item.productId?._id === product._id
    );
  
    const cartItem = {
      id: product._id,
      name: product.title,
      image: product.images[0],
      price: product.price,
      finalPrice: product.finalPrice,
      quantity: finalQty,
    };
  
    try {
      if (!user?.email) {
        await dispatch(addToCart(cartItem));
        toast.success(
          isInLocalCart ? "Quantity updated!" : `${product.title} added.`
        );
      } else {
        dispatch(addtoCartState({ id: product._id }));
        dispatch(addToCartAPIThunk({ productId: product._id, quantity: finalQty }));
        toast.success(
          isInApiCart ? "Quantity updated!" : `${product.title} added.`
        );
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };
  
  // 🧩 Wishlist logic
  const handleAddToWishlist = (_id, title, images, finalPrice, price) => {
    const isLoggedIn = !!user?.email;
    const isAlreadyInWishlist = wishlistItems?.some((item) =>
      isLoggedIn ? item._id === _id : item.id === _id
    );

    if (isLoggedIn) {
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

  const displayProducts = useMemo(
    () => (products?.length > 0 ? products : allProducts),
    [products, allProducts]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse space-y-2 rounded-lg border border-gray-200 p-4 shadow"
          >
            <div className="h-32 bg-gray-300 rounded-md"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        Error loading products.
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside
            className="md:col-span-4 lg:col-span-3"
            style={{ overflowY: "scroll", height: "100vh" }}
          >
            <Sidebar
              categoryId={selectedCategoryId}
              onSubcategorySelect={(id) => setSelectedSubcategoryId(id)}
            />
          </aside>

          <main className="md:col-span-8 lg:col-span-9">
            <FilterCategories
              subcategoryId={subcategoryId}
              onCategorySelect={(cat) => setSelectedCategoryId(cat?._id)}
            />

            {displayProducts?.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 mt-5">
                {displayProducts?.map((product) => {
                
                  const qty = quantities[product?._id] || 0;
                         console.log(product)
                  const pricePerPc = getPricePerPc(product, qty); 
                  
                  const total = (qty * pricePerPc).toFixed(2);
                  const basePrice = product?.finalPrice || 26.56;
                  const saved =
  qty > 0 && pricePerPc < basePrice
    ? ((basePrice - pricePerPc) * qty).toFixed(2)
    : 0;


                  return (
                    <div
                      key={product?._id}
                      className="border border-gray-200 bg-white rounded-lg p-3 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* IMAGE + WISHLIST */}
                      <div className="relative">
                        {product.discount > 0 && (
                          <div className="absolute top-2 left-0 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-e-2xl z-10">
                            {product.discount}%
                          </div>
                        )}
                        <div
                          className="bg-white text-black absolute top-2 right-3 shadow-md rounded-2xl p-1 cursor-pointer hover:scale-105 transition"
                          onClick={() =>
                            handleAddToWishlist(
                              product._id,
                              product.title,
                              product.img,
                              product.finalPrice,
                              product.oldPrice
                            )
                          }
                        >
                          {user?.email
                            ? wishlistItems?.some(
                              (item) => item?._id === product._id
                            )
                              ? "❤️"
                              : <Heart size={16} />
                            : wishlistItems?.some(
                              (item) => item.id === product._id
                            )
                              ? "❤️"
                              : <Heart size={16} />}
                        </div>
                        <Link href={`/pages/shop/${product._id}`}>
                          <div className="w-full h-40 flex justify-center items-center overflow-hidden bg-white rounded">
                            <Image
                              src={
                                product.images[0]
                                  ? `${serverUrl}/public/image/${product.images[0]}`
                                  : CallBackImg
                              }
                              alt={product.title}
                              width={150}
                              height={150}
                              className="object-contain h-full transition-transform duration-200 hover:scale-105"
                            />
                          </div>
                        </Link>
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="mt-2 flex flex-col flex-grow">
                        <h3 className="text-sm md:text-base font-medium line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
                          {
                            new DOMParser().parseFromString(
                              product.description || "",
                              "text/html"
                            ).body.textContent
                          }
                        </p>

                        {/* DISCOUNT TIERS */}
                        {/* {product?.package?.length > 0 &&
                          <div className="bg-blue-50 p-2 mt-2 rounded-lg text-xs">
                            {getDiscountTiers(product).map((tier, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center mb-1"
                              >
                                <span>
                                  ₹{tier?.price}/{tier?.unit} for {tier?.stock} {tier?.unit}+
                                </span>
                                <button
                                  onClick={() =>
                                    handleQtyChange(product._id, Number(tier?.stock))
                                  }
                                  className="text-blue-600 font-semibold hover:underline"
                                >
                                  Add {Number(tier?.stock)}
                                </button>
                              </div>
                            ))}
                          </div>
                        } */}

                      {/* {product?.package && product?.package.map((item, index) => (
                        <div className="flex gap-2 mt-4 bg-gray-200 p-1 rounded">
                          <p className="text-xs text-[11px]   sm:text-sm ">₹{item?.price}/{item?.unit} for {item.stock} {item.unit}+</p> <span className="text-green-600 sm:text-sm">Add {item?.stock}</span>
                        </div>
                      ))} */}

<div className="mt-2">
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

        {/* Add package button */}
        <button
          onClick={() => {
            handleQtyChange(product._id, item.stock);
            handleAddToCart(product);   // 🔥 ensures Add button becomes qty box
          }}
          className="text-pink-600 text-xs font-semibold"
        >
          Add {item.stock}
        </button>
      </div>
    );
  })}
</div>



                      {/* TOTAL PRICE + ADD BUTTON ROW */}
                      <div className="flex items-center justify-between mt-3">
  <div className="text-sm font-semibold text-gray-800">₹{qty<=1 ? pricePerPc : total}</div>

  {qty === 0 ? (
    <button
      onClick={() => handleAddToCart(product)}
      className="bg-white-500 border-2 bg-red-50 text-xs text-red-600 border-red-400  px-4 py-1 rounded-xl  hover:bg-red-600  hover:text-white  hover:border-red-600"
    >
      Add
    </button>
  ) : (
    <div className="flex items-center gap-2">

      <button
        onClick={() => decrementQty(product._id)}
        className="px-2 py-1 bg-gray-300 rounded"
      >
        -
      </button>

      <span className="px-3">{qty}</span>

      <button
        onClick={() => incrementQty(product._id)}
        className="px-2 py-1 bg-gray-300 rounded"
      >
        +
      </button>
    </div>
  )}
</div>




                      {/* <div className="flex items-baseline gap-2 mt-2">
                        <div className="text-base md:text-lg font-bold text-red-500">
                          ₹{product.finalPrice}
                        </div>
                        {typeof product.discount === "number" &&
                          product.discount > 0 && (
                            <div className="text-xs md:text-sm text-gray-500 line-through">
                              ₹ {product.price}
                            </div>
                          )}
                        </div> */}

                        {/* SAVINGS DISPLAY */}
                        {saved > 0 && (
  <div className="mt-2 bg-green-50 text-green-700 text-xs font-semibold text-center rounded-lg p-1">
    You saved ₹{saved} total!
  </div>
)}


                        {/* <button
                          onClick={() => handleAddToCart(product)}
                          className="mt-3 bg-gray-700 text-white py-2 rounded-lg text-xs font-semibold hover:bg-gray-800"
                        >
                          Add to cart 🛒
                        </button> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Page;
     