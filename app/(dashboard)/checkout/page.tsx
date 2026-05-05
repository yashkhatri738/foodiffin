"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  saveOrUpdateAddress,
  getUserAddress,
  type AddressData,
} from "@/lib/address.action";
import { createOrder, type CreateOrderData } from "@/lib/order.action";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";
import {
  MapPin,
  User,
  Phone,
  Home,
  Building2,
  Package,
  ShoppingBag,
  CreditCard,
  Wallet,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";

interface OrderForm {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: "home" | "office" | "other";
  latitude?: number;
  longitude?: number;
  payment_method: "online" | "cash";
}

export default function CheckoutPage() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrderForm>({
    defaultValues: {
      address_type: "home",
      country: "India",
      payment_method: "cash",
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [hasExistingAddress, setHasExistingAddress] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();

  const { items, totalPrice, increment, decrement, removeItem, clear } =
    useCart();
  const addressType = watch("address_type");
  const paymentMethod = watch("payment_method");

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isLoadingAddress) {
      toast.error("Your cart is empty!");
      router.push("/");
    }
  }, [items, isLoadingAddress, router]);

  // Load existing address on mount
  useEffect(() => {
    loadExistingAddress();
  }, []);

  const loadExistingAddress = async () => {
    setIsLoadingAddress(true);
    const result = await getUserAddress();

    if (result.data) {
      setHasExistingAddress(true);
      reset({
        full_name: result.data.full_name,
        phone: result.data.phone,
        address_line1: result.data.address_line1,
        address_line2: result.data.address_line2 || "",
        landmark: result.data.landmark || "",
        city: result.data.city,
        state: result.data.state,
        postal_code: result.data.postal_code,
        country: result.data.country,
        address_type: result.data.address_type,
        latitude: result.data.latitude,
        longitude: result.data.longitude,
      });
    }
    setIsLoadingAddress(false);
  };

  const getCurrentLocation = async () => {
    setIsProcessing(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsProcessing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = await res.json();
          const address = data.address;

          // Update form fields with the retrieved address
          setValue("address_line1", data.display_name || "");
          setValue(
            "city",
            address.city || address.town || address.village || "",
          );
          setValue("state", address.state || "");
          setValue("postal_code", address.postcode || "");
          setValue("country", address.country || "India");
          setValue("latitude", lat);
          setValue("longitude", lng);

          toast.success("Location detected successfully!");
        } catch (error) {
          toast.error("Failed to retrieve address from coordinates");
        }
        setIsProcessing(false);
      },
      (error) => {
        toast.error("Unable to retrieve your location");
        setIsProcessing(false);
      },
    );
  };

  const onSaveAddress = async (data: OrderForm) => {
    setIsSaving(true);

    const addressData: AddressData = {
      full_name: data.full_name,
      phone: data.phone,
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      address_type: data.address_type,
      latitude: data.latitude,
      longitude: data.longitude,
      is_default: true,
    };

    const result = await saveOrUpdateAddress(addressData);

    if (result.error) {
      toast.error(result.error);
      setIsSaving(false);
      return false;
    } else {
      setHasExistingAddress(true);
      toast.success(
        hasExistingAddress
          ? "Address updated successfully!"
          : "Address saved successfully!",
      );
      setShowPayment(true);
      setIsSaving(false);
      return true;
    }
  };

  const onPlaceOrder = async (data: OrderForm) => {
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Save address first if not showing payment yet
    if (!showPayment) {
      const saved = await onSaveAddress(data);
      if (!saved) return;
      // Scroll to payment section
      setTimeout(() => {
        document.getElementById("payment-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 300);
      return;
    }

    // Create order
    setIsSaving(true);

    // Get restaurant_id from first item (assuming all items are from same restaurant)
    const restaurantId = items[0].restaurantId;

    const orderData: CreateOrderData = {
      restaurant_id: restaurantId,
      total_amount: totalPrice,
      payment_method: data.payment_method,
      address: {
        full_name: data.full_name,
        phone: data.phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        address_type: data.address_type,
      },
      items: items.map((item) => ({
        dish_id: item.dishId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const result = await createOrder(orderData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Order placed successfully!");
      clear(); // Clear cart
      router.push("/"); // Redirect to home or orders page
    }

    setIsSaving(false);
  };

  if (isLoadingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" />
                    Your Order
                  </h2>
                  <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add More
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.dishId}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {item.image_url && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.restaurantName}
                      </p>
                      <p className="text-orange-600 font-semibold mt-1">
                        ₹{item.price}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.dishId)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                        <button
                          onClick={() => decrement(item.dishId)}
                          className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increment(item.dishId)}
                          className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Delivery Address
                </h2>
              </div>

              <form
                onSubmit={handleSubmit(onPlaceOrder)}
                className="px-6 py-6 space-y-6"
              >
                {/* Location Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <MapPin className="w-4 h-4" />
                    {isProcessing ? "Detecting..." : "Use Current Location"}
                  </button>
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Personal Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("full_name", {
                          required: "Full name is required",
                        })}
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="John Doe"
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message:
                              "Please enter a valid 10-digit phone number",
                          },
                        })}
                        type="tel"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="9876543210"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Home className="w-5 h-5 text-orange-500" />
                    Address Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("address_line1", {
                        required: "Address is required",
                      })}
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="House No., Building Name"
                    />
                    {errors.address_line1 && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.address_line1.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      {...register("address_line2")}
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Road Name, Area, Colony"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark
                    </label>
                    <input
                      {...register("landmark")}
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Near Hospital, Mall, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("city", { required: "City is required" })}
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("state", {
                          required: "State is required",
                        })}
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("postal_code", {
                          required: "Postal code is required",
                          pattern: {
                            value: /^[0-9]{6}$/,
                            message: "Please enter a valid 6-digit PIN code",
                          },
                        })}
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="400001"
                      />
                      {errors.postal_code && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.postal_code.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("country", {
                        required: "Country is required",
                      })}
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="India"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Type */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    Address Type
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input
                        {...register("address_type")}
                        type="radio"
                        value="home"
                        className="sr-only"
                      />
                      <div
                        className={`flex flex-col items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                          addressType === "home"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                        }`}
                      >
                        <Home className="w-5 h-5" />
                        <span className="font-medium text-sm">Home</span>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        {...register("address_type")}
                        type="radio"
                        value="office"
                        className="sr-only"
                      />
                      <div
                        className={`flex flex-col items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                          addressType === "office"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="font-medium text-sm">Office</span>
                      </div>
                    </label>

                    <label className="cursor-pointer">
                      <input
                        {...register("address_type")}
                        type="radio"
                        value="other"
                        className="sr-only"
                      />
                      <div
                        className={`flex flex-col items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
                          addressType === "other"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                        }`}
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="font-medium text-sm">Other</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment Method - Show after address is saved */}
                {showPayment && (
                  <div
                    id="payment-section"
                    className="space-y-4 pt-4 border-t border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-orange-500" />
                      Payment Method
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="cursor-pointer">
                        <input
                          {...register("payment_method")}
                          type="radio"
                          value="cash"
                          className="sr-only"
                        />
                        <div
                          className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                            paymentMethod === "cash"
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-300 bg-white hover:border-orange-300"
                          }`}
                        >
                          <Wallet
                            className={`w-8 h-8 ${paymentMethod === "cash" ? "text-orange-600" : "text-gray-600"}`}
                          />
                          <div className="text-center">
                            <p
                              className={`font-semibold ${paymentMethod === "cash" ? "text-orange-700" : "text-gray-900"}`}
                            >
                              Cash on Delivery
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Pay when you receive
                            </p>
                          </div>
                        </div>
                      </label>

                      <label className="cursor-pointer">
                        <input
                          {...register("payment_method")}
                          type="radio"
                          value="online"
                          className="sr-only"
                        />
                        <div
                          className={`flex flex-col items-center gap-3 p-6 border-2 rounded-lg transition-all ${
                            paymentMethod === "online"
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-300 bg-white hover:border-orange-300"
                          }`}
                        >
                          <CreditCard
                            className={`w-8 h-8 ${paymentMethod === "online" ? "text-orange-600" : "text-gray-600"}`}
                          />
                          <div className="text-center">
                            <p
                              className={`font-semibold ${paymentMethod === "online" ? "text-orange-700" : "text-gray-900"}`}
                            >
                              Online Payment
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Pay securely online
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving || isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Package className="w-6 h-6" />
                    {isSaving
                      ? "Processing..."
                      : showPayment
                        ? "Confirm Order"
                        : "Continue to Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Items (
                      {items.reduce((sum, item) => sum + item.quantity, 0)})
                    </span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Amount
                      </span>
                      <span className="text-2xl font-bold text-orange-600">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    🎉 You're saving delivery charges!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
