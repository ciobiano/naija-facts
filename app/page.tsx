import ModernLanding from "../components/ui/sections/home/modern-landing";

export default function HomePage() {
	return (
		<div className=" ">
			<div className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0 ">
				<div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-green-600 to-white"></div>
				<div className="h-[10rem] rounded-full w-[90rem] z-1 bg-gradient-to-b blur-[20rem] from-white to-green-700"></div>
				<div className="h-[10rem] rounded-full w-[60rem] z-1 bg-gradient-to-b blur-[6rem] from-green-500 to-green-800"></div>
			</div>
			<div className="absolute inset-0 z-0 bg-noise opacity-30"></div>

			{/* Hero Section */}
			<ModernLanding />
		</div>
	);
}
