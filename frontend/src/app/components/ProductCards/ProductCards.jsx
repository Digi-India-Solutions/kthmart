import Image from "next/image";
import './productCard.css'

export default function ProductCard({ name, price, oldPrice, discount, img, rating }) {
  return (
    <div className="productCard bg-white rounded-xl shadow-sm border p-3 flex flex-col justify-between hover:shadow-md transition duration-300">
      
      {/* Product Image */}
      <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52 xl:h-56">
        {discount && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs sm:text-sm px-2 py-1 rounded-full z-10">
            {discount}
          </span>
        )}
        <Image
          src={img}
          alt={name}
          fill
          className="object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="mt-3 flex-1">
        <h3 className="text-xs sm:text-sm md:text-base font-semibold line-clamp-2">{name}</h3>
        {rating && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1">⭐ {rating.toFixed(1)}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base">₹{price}</span>
          {oldPrice && (
            <span className="text-gray-400 line-through text-xs sm:text-sm">
              ₹{oldPrice}
            </span>
          )}
        </div>
      </div>

      {/* Add Button */}
      <button className="mt-3 w-full border border-red-400 text-red-500 font-semibold py-1.5 sm:py-2 rounded-lg hover:bg-red-50 transition">
        ADD
      </button>
    </div>
  );
}
