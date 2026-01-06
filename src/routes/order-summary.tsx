import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	MoreHorizontal,
	ChevronLeft,
	Minus,
	Plus,
	TicketPercent,
	User,
	MapPin,
	Phone,
	StickyNote,
	Navigation,
	Send,
	Bike,
	CheckCircle2,
	Download,
	Eye,
} from "lucide-react";
import { Drawer } from "vaul";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/order-summary")({
	component: OrderSummaryPage,
});

function OrderSummaryPage() {
	const navigate = useNavigate();
	const [cart, setCart] = useState<any[]>([]);

	// Shop Coordinates (Plaza Senayan)
	const SHOP_COORDS = { lat: -6.2260056, lng: 106.7991222 };

	const [promoCode, setPromoCode] = useState("");
	const [appliedDiscount, setAppliedDiscount] = useState(0);
	const [distance, setDistance] = useState<number | null>(null);
	const [isCalculating, setIsCalculating] = useState(false);
	const [selectedQris, setSelectedQris] = useState<"nagari" | "bni" | null>(
		null
	);
	const [customerDetails, setCustomerDetails] = useState({
		name: "",
		phone: "",
		address: "",
		notes: "",
	});

	useEffect(() => {
		const savedCart = localStorage.getItem("monolog-cart");
		if (savedCart) {
			try {
				setCart(JSON.parse(savedCart));
			} catch (e) {
				console.error("Failed to parse cart", e);
			}
		}
	}, []);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setCustomerDetails((prev) => ({ ...prev, [name]: value }));
	};

	const handleApplyPromo = () => {
		if (promoCode.trim().toUpperCase() === "MONOLOG") {
			const discount = totalPrice * 0.1; // 10% discount
			setAppliedDiscount(discount);
			alert("Promo applied! 10% discount.");
		} else {
			setAppliedDiscount(0);
			alert("Invalid promo code");
		}
	};

	const calculateDistance = () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by your browser");
			return;
		}

		setIsCalculating(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const userLat = position.coords.latitude;
				const userLng = position.coords.longitude;

				// Haversine Formula
				const R = 6371; // Radius of the earth in km
				const dLat = deg2rad(userLat - SHOP_COORDS.lat);
				const dLon = deg2rad(userLng - SHOP_COORDS.lng);
				const a =
					Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(deg2rad(SHOP_COORDS.lat)) *
					Math.cos(deg2rad(userLat)) *
					Math.sin(dLon / 2) *
					Math.sin(dLon / 2);
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				const d = R * c; // Distance in km

				setDistance(parseFloat(d.toFixed(1)));
				setIsCalculating(false);
			},
			(error) => {
				console.error("Error getting location", error);
				alert("Unable to retrieve your location");
				setIsCalculating(false);
			}
		);
	};

	const deg2rad = (deg: number) => {
		return deg * (Math.PI / 180);
	};

	const handleCheckout = () => {
		if (
			!customerDetails.name ||
			!customerDetails.phone ||
			!customerDetails.address
		) {
			alert("Please fill in valid name, phone, and address");
			return;
		}

		const deliveryFee = distance ? Math.ceil(distance) * 5000 : 0;
		const finalTotal = Math.max(0, totalPrice + deliveryFee - appliedDiscount);

		const message = `
*New Order from Monolog App!* 🍽️

*Customer Details:*
👤 Name: ${customerDetails.name}
📱 Phone: ${customerDetails.phone}
📍 Address: ${customerDetails.address}
${distance ? `📏 Distance: ${distance} km` : ""}
${customerDetails.notes ? `📝 Note: ${customerDetails.notes}` : ""}

*Order Summary:*
${cart
				.map(
					(item) =>
						`- ${item.name} x${item.quantity} (${formatPrice(
							item.price * item.quantity
						)})
  ${item.customizations
							? Object.values(item.customizations)
								.flat()
								.filter(Boolean)
								.join(", ")
							: ""
						} ${item.notes ? `"${item.notes}"` : ""}`
				)
				.join("\n")}

--------------------------------
💵 Subtotal: ${formatPrice(totalPrice)}
🚚 Delivery Fee: ${formatPrice(deliveryFee)}
${appliedDiscount > 0 ? `🏷️ Discount: -${formatPrice(appliedDiscount)}` : ""}
*💰 TOTAL: ${formatPrice(finalTotal)}*

Please process my order! Thank you.
        `.trim();

		const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
			message
		)}`;
		window.open(whatsappUrl, "_blank");
	};

	const updateQuantity = (index: number, delta: number) => {
		const newCart = [...cart];
		const item = newCart[index];
		const newQuantity = item.quantity + delta;

		if (newQuantity <= 0) {
			newCart.splice(index, 1);
		} else {
			item.quantity = newQuantity;
		}

		setCart(newCart);
		localStorage.setItem("monolog-cart", JSON.stringify(newCart));
	};

	const downloadImage = (url: string, filename: string) => {
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleViewImage = (url: string) => {
		window.open(url, "_blank");
	};

	const getMinOrder = (dist: number) => {
		if (dist <= 1) return 50000;
		if (dist <= 2) return 60000;
		if (dist <= 3) return 70000;
		if (dist <= 4) return 90000;
		return 110000;
	};

	const formatPrice = (price: number) => `Rp ${price.toLocaleString("id-ID")}`;

	const totalPrice = cart.reduce(
		(acc, item) => acc + item.price * item.quantity,
		0
	);
	const deliveryFee = distance ? Math.ceil(distance) * 5000 : 0;
	const finalTotal = Math.max(0, totalPrice + deliveryFee - appliedDiscount);

	return (
		<div className="min-h-screen flex flex-col font-sans bg-background">
			{/* Header */}
			<header className="px-6 py-6 flex items-center justify-between sticky top-0 z-20 bg-background/90 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<button
						onClick={() => navigate({ to: "/" })}
						className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
					>
						<ChevronLeft className="w-6 h-6 text-dark" />
					</button>
					<h1 className="text-2xl font-bold text-dark capitalize">
						List Orderan
					</h1>
				</div>

				<button className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
					<MoreHorizontal className="w-6 h-6 text-dark" />
				</button>
			</header>

			{/* Main Content - Unified Scroll */}
			<main className="flex-1 px-6 pb-96 space-y-6 overflow-y-auto">
				{/* Order List */}
				<section className="space-y-4">
					{cart.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-[20vh] text-center opacity-50">
							<p className="text-xl font-bold text-gray-400">
								Your cart is empty
							</p>
							<button
								onClick={() => navigate({ to: "/" })}
								className="mt-4 text-primary font-bold"
							>
								Back to Menu
							</button>
						</div>
					) : (
						cart.map((item, index) => (
							<div
								key={index}
								className="bg-white rounded-[20px] p-2 flex gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0 overflow-hidden">
									{item.image ? (
										<img
											src={item.image}
											alt={item.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-xs">
											No Img
										</div>
									)}
								</div>

								<div className="flex-1 flex flex-col justify-between">
									<div>
										<h3 className="font-bold text-dark text-lg leading-tight">
											{item.name}
										</h3>
										{item.customizations && (
											<div className="text-xs text-gray-400 mt-1 space-x-1">
												{Object.entries(item.customizations).map(
													([key, value]) => {
														if (
															!value ||
															(Array.isArray(value) && value.length === 0)
														)
															return null;
														return (
															<span
																key={key}
																className="bg-gray-50 px-1.5 py-0.5 rounded text-[10px]"
															>
																{Array.isArray(value)
																	? value.join(", ")
																	: String(value)}
															</span>
														);
													}
												)}
											</div>
										)}
										{item.notes && (
											<p className="text-xs text-gray-400 italic mt-1">
												"{item.notes}"
											</p>
										)}
									</div>

									<div className="flex items-center justify-between mt-2">
										<p className="font-bold text-dark">
											{formatPrice(item.price * item.quantity)}
										</p>

										<div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1">
											<button
												onClick={() => updateQuantity(index, -1)}
												className="w-6 h-6 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform"
											>
												<Minus className="w-3 h-3 text-dark" />
											</button>
											<span className="font-bold text-sm min-w-4 text-center">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQuantity(index, 1)}
												className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center active:scale-90 transition-transform"
											>
												<Plus className="w-3 h-3" />
											</button>
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</section>

				{/* Customer Details Form */}
				<section className="bg-white rounded-[20px] p-5 space-y-4">
					<h3 className="font-bold text-dark text-lg mb-2">Customer Details</h3>
					<div className="space-y-3">
						<div className="space-y-1">
							<div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-primary/20 transition-colors">
								<User className="w-4 h-4 text-gray-400" />
								<input
									type="text"
									name="name"
									value={customerDetails.name}
									onChange={handleInputChange}
									placeholder="Masukan Nama"
									className="bg-transparent w-full text-sm font-medium outline-none text-dark placeholder-gray-400"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-primary/20 transition-colors">
								<Phone className="w-4 h-4 text-gray-400" />
								<input
									type="tel"
									name="phone"
									value={customerDetails.phone}
									onChange={handleInputChange}
									placeholder="Masukan No. Telepon"
									className="bg-transparent w-full text-sm font-medium outline-none text-dark placeholder-gray-400"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<div className="bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-3 border border-transparent focus-within:border-primary/20 transition-colors">
								<MapPin className="w-4 h-4 text-gray-400 mt-1" />
								<textarea
									name="address"
									value={customerDetails.address}
									onChange={handleInputChange}
									placeholder="Masukan Alamat"
									className="bg-transparent w-full text-sm font-medium outline-none text-dark placeholder-gray-400 min-h-[60px] resize-none"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<div className="bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-3 border border-transparent focus-within:border-primary/20 transition-colors">
								<StickyNote className="w-4 h-4 text-gray-400 mt-1" />
								<textarea
									name="notes"
									value={customerDetails.notes}
									onChange={handleInputChange}
									placeholder="Catatan untuk masakan..."
									className="bg-transparent w-full text-sm font-medium outline-none text-dark placeholder-gray-400 min-h-[60px] resize-none"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* Distance Calculation */}
				<section className="bg-white rounded-[20px] p-5">
					<h3 className="font-bold text-dark text-lg flex items-center gap-2 mb-3">
						<Bike className="w-5 h-5 text-blue-500" /> Cek Jarak Delivery
					</h3>

					<div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl p-4">
						<div className="flex-1">
							<p className="text-xs text-blue-600 font-bold mb-1">
								Jarak ke lokasi Anda
							</p>
							{distance !== null ? (
								<p className="text-xl font-black text-blue-700 flex items-center gap-1">
									{distance} km
								</p>
							) : (
								<p className="text-sm text-blue-400 italic">Belum dihitung</p>
							)}
						</div>
						<button
							onClick={calculateDistance}
							disabled={isCalculating}
							className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isCalculating ? (
								<>Loading...</>
							) : (
								<>
									<Navigation className="w-3 h-3" /> Cek Jarak
								</>
							)}
						</button>
					</div>

					{/* Minimum Order Validation */}
					{distance !== null && (
						<div
							className={`mt-4 rounded-xl p-4 flex items-start gap-3 ${totalPrice >= getMinOrder(distance)
								? "bg-green-50 border border-green-100"
								: "bg-red-50 border border-red-100"
								}`}
						>
							{totalPrice >= getMinOrder(distance) ? (
								<>
									<CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
									<div>
										<p className="text-green-700 font-bold text-sm">
											Jarak dan Minimal Order Sesuai!
										</p>
										<p className="text-green-600 text-xs">
											Pesanan anda siap diproses.
										</p>
									</div>
								</>
							) : (
								<>
									<div className="w-full">
										<div className="flex items-start gap-3 mb-3">
											<div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
												<span className="text-red-600 font-bold text-xs">
													!
												</span>
											</div>
											<div>
												<p className="text-red-700 font-bold text-sm">
													Minimal Order Belum Sesuai
												</p>
												<p className="text-red-600 text-xs mt-1">
													Jarak {distance} km minimal order{" "}
													{formatPrice(getMinOrder(distance))}
												</p>
												<p className="text-red-600 text-xs font-bold mt-1">
													Kurang{" "}
													{formatPrice(getMinOrder(distance) - totalPrice)}
												</p>
											</div>
										</div>
										<button
											onClick={() => navigate({ to: "/" })}
											className="w-full bg-red-100 text-red-700 text-xs font-bold py-2 rounded-lg active:scale-95 transition-transform"
										>
											Tambah Orderan
										</button>
									</div>
								</>
							)}
						</div>
					)}

					<div className="mt-3 text-[10px] text-gray-400 text-center">
						Lokasi Store: Plaza Senayan (
						<a
							href="https://maps.app.goo.gl/T1MVEqTnwvYet2Ca6"
							target="_blank"
							rel="noreferrer"
							className="text-blue-500 underline"
						>
							Buka Peta
						</a>
						)
					</div>
				</section>

				{/* QRIS Download Section */}
				<section className="bg-white rounded-[20px] p-5">
					<div className="flex flex-row  justify-between">
						<h3 className="font-bold text-dark text-lg flex items-center gap-2 mb-4">
							<TicketPercent className="w-5 h-5 text-primary" /> Pembayaran QRIS
						</h3>

					</div>

					<div className="grid grid-cols-2 gap-4">
						{/* QRIS Nagari */}
						<div className="flex flex-col gap-3">
							<div
								onClick={() => setSelectedQris("nagari")}
								className={`
                  relative flex flex-col items-center gap-2 rounded-[20px] p-3 border-2 cursor-pointer transition-all bg-gray-50
                  ${selectedQris === "nagari"
										? "border-primary bg-primary/5"
										: "border-transparent hover:bg-gray-100"
									}
                `}
							>
								{selectedQris === "nagari" && (
									<div className="absolute top-2 right-2 text-primary">
										<CheckCircle2 className="w-5 h-5 fill-primary text-white" />
									</div>
								)}
								<div className="bg-white rounded-xl p-2 w-full aspect-square flex items-center justify-center overflow-hidden border border-gray-100">
									<img
										src="/qris-nagari.png"
										alt="QRIS Nagari"
										className="w-full h-full object-contain"
									/>
								</div>
								<p className="text-sm font-bold text-dark">Nagari</p>
							</div>
						</div>

						{/* QRIS BNI */}
						<div className="flex flex-col gap-3">
							<div
								onClick={() => setSelectedQris("bni")}
								className={`
                  relative flex flex-col items-center gap-2 rounded-[20px] p-3 border-2 cursor-pointer transition-all bg-gray-50
                  ${selectedQris === "bni"
										? "border-primary bg-primary/5"
										: "border-transparent hover:bg-gray-100"
									}
                `}
							>
								{selectedQris === "bni" && (
									<div className="absolute top-2 right-2 text-primary">
										<CheckCircle2 className="w-5 h-5 fill-primary text-white" />
									</div>
								)}
								<div className="bg-white rounded-xl p-2 w-full aspect-square flex items-center justify-center overflow-hidden border border-gray-100">
									<img
										src="/qris-bni.png"
										alt="QRIS BNI"
										className="w-full h-full object-contain"
									/>
								</div>
								<p className="text-sm font-bold text-dark">BNI</p>
							</div>
						</div>
					</div>
					<div className="flex gap-2 w-full mt-4">
						<button
							onClick={() => downloadImage("/qris-bni.png", "qris-bni.png")}
							className="flex-1 bg-primary text-white text-xs font-bold py-4 rounded-full flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
						>
							<Download className="w-3.5 h-3.5" /> Download
						</button>
						<button
							onClick={() => handleViewImage("/qris-bni.png")}
							className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full active:scale-95 transition-transform shrink-0"
						>
							<Eye className="w-3.5 h-3.5 text-gray-600" />
						</button>
					</div>
				</section>
			</main>

			<div className="z-30">
				<Drawer.Root open={true} modal={false}>
					<Drawer.Portal>
						<Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] bg-background/90 backdrop-blur-md border-t border-white/50">
							<div className="p-4 bg-transparent flex-1 space-y-3">
								<div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-300 mb-4" />
								<section className="w-full">
									<div className="bg-white rounded-full p-2 flex items-center gap-3 shadow-sm">
										<div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
											<TicketPercent className="w-5 h-5" />
										</div>
										<div className="flex-1">
											<div className="flex gap-2">
												<input
													type="text"
													value={promoCode}
													onChange={(e) => setPromoCode(e.target.value)}
													placeholder="Masukan Kode Promo"
													className="flex-1 bg-transparent rounded-full px-3 py-1.5 text-sm outline-none border border-transparent focus:border-primary transition-all"
												/>
												<button
													onClick={handleApplyPromo}
													className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full active:scale-95 transition-transform"
												>
													Apply
												</button>
											</div>
										</div>
									</div>
									{appliedDiscount > 0 && (
										<p className="text-green-600 text-xs font-bold mt-2 ml-2">
											Promo applied! You saved {formatPrice(appliedDiscount)}
										</p>
									)}
								</section>
								<div className="flex flex-col bg-white rounded-[20px] p-5 mb-4 font-sans shadow-sm">
									<div className="flex justify-between items-center text-sm">
										<span className="text-[#454343]">Subtotal</span>
										<span className="text-[#050404] font-bold">
											{formatPrice(totalPrice)}
										</span>
									</div>

									{distance !== null && (
										<div className="flex justify-between items-center text-sm mt-2">
											<span className="text-[#454343]">Delivery Fee</span>
											<span className="text-[#050404] font-bold">
												{formatPrice(deliveryFee)}
											</span>
										</div>
									)}

									{appliedDiscount > 0 && (
										<div className="flex justify-between items-center text-sm mt-2">
											<span className="text-[#454343]">Discount</span>
											<span className="text-[#050404] font-bold">
												- {formatPrice(appliedDiscount)}
											</span>
										</div>
									)}

									<hr className="border-dashed border-[#E3E3E3] my-3" />

									<div className="flex justify-between items-center">
										<span className="text-[#454343] font-bold text-sm">
											Total Payment
										</span>
										<span className="text-[#050404] font-bold text-sm">
											{formatPrice(finalTotal)}
										</span>
									</div>
								</div>
								<button
									onClick={handleCheckout}
									className="w-full bg-primary text-white font-bold text-lg py-4 rounded-full active:scale-95 transition-all hover:bg-opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
								>
									Order Via Whatsapp <Send className="w-5 h-5" />
								</button>
							</div>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.Root>
			</div>
		</div>
	);
}
