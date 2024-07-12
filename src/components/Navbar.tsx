"use client";

import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";

import { LogOut, MenuIcon, PanelLeftCloseIcon, SidebarCloseIcon } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery } from "@tanstack/react-query";
import { isUserSubscribed } from "@/app/premium/actions";
import { useMediaQuery } from "@/hooks/use-media-query";
import {  
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger, 
} from "./ui/drawer";
import { RotateCounterClockwiseIcon } from "@radix-ui/react-icons";

interface RouteProps {
	href: string;
	label: string;
}

const routeList: RouteProps[] = [
	{
		href: "/",
		label: "Home",
	},
	{
		href: "#team",
		label: "Team",
	},
	{
		href: "#testimonials",
		label: "Testimonials",
	},
];



export const Navbar = () => {
	const isDesktop = useMediaQuery("(min-width: 768px)")

	const { isAuthenticated } = useKindeBrowserClient()

	const { data } = useQuery({
		queryKey: ["isUserSubscribed"],
		queryFn: async () => isUserSubscribed(),
	});

	const isSubscribed = data?.subscribed;

	return (
		<header
			className='sticky border-b-[1px] top-0 z-40 w-full  dark:border-b-slate-700 overflow-x-hidden
			bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
		>
			{ isDesktop ? (
				<NavigationMenu className='mx-auto'>
					<NavigationMenuList className='container min-h-14 w-screen flex justify-between '>
						<NavigationMenuItem className='font-bold lg:flex hidden'>
							<a rel='noreferrer noopener' href='/' className='ml-2 font-bold text-xl flex'>
								<span className='uppercase bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-transparent bg-clip-text'>
									🚀 Next Stripe
								</span>
							</a>
						</NavigationMenuItem>

						<nav className='md:flex hidden gap-2'>
							{routeList.map((route: RouteProps, i) => (
								<Link
									rel='noreferrer noopener'
									href={route.href}
									key={i}
									className={`text-[17px] ${buttonVariants({
										variant: "ghost",
									})}`}
								>
									{route.label}
								</Link>
							))}
							{isAuthenticated && isSubscribed && (
								<Link
									rel='noreferrer noopener'
									href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_URL!}
									target='_blank'
									className={`text-[17px] ${buttonVariants({
										variant: "ghost",
									})}`}
								>
									Billing Portal
								</Link>
							)}
						</nav>

						<div className='hidden md:flex gap-2'>
							{isAuthenticated && (
								<Link
									rel='noreferrer noopener'
									href='/api/auth/logout'
									className={`border ${buttonVariants({ variant: "secondary" })}`}
								>
									Logout
									<LogOut className='w-4 h-4 ml-2' />
								</Link>
							)}

							{!isAuthenticated && (
								<Link
									rel='noreferrer noopener'
									href='/api/auth/login'
									className={`border ${buttonVariants({ variant: "secondary" })}`}
								>
									Login
								</Link>
							)}

							{isAuthenticated && isSubscribed && (
								<Link
									rel='noreferrer noopener'
									href='/premium'
									// shining animated button with purple gradient
									className={`border bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white ${buttonVariants(
										{
											variant: "secondary",
										}
									)}`}
								>
									Premium ✨
								</Link>
							)}

							<ModeToggle />
						</div>
					</NavigationMenuList>					
				</NavigationMenu>
			) : (
				<div className='container min-h-14 w-screen flex justify-between items-center '>
					<Drawer direction="right">
					<div className="flex w-full justify-between items-center">
						<DrawerTrigger>
							<MenuIcon />
						</DrawerTrigger>
						<a rel='noreferrer noopener' href='/' className='mr-2 font-bold text-xl flex'>
							<span className='uppercase bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-transparent bg-clip-text'>
								🚀 Next Stripe
							</span>
						</a>
						<ModeToggle />
					</div>
					
					<DrawerContent>
						<DrawerHeader>
							<DrawerClose>								
								<div className="flex justify-between align-middle">
									<PanelLeftCloseIcon />
									<a rel='noreferrer noopener' href='/' className='ml-2 font-bold text-xl flex'>
										<span className='uppercase bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-transparent bg-clip-text'>
											🚀 Next Stripe
										</span>
									</a>
								</div>								
							</DrawerClose>
							<DrawerTitle className="mt-8" >Subscription Payments</DrawerTitle>
							<DrawerDescription >Made easy with stripe.</DrawerDescription>
						</DrawerHeader>

						<nav className='flex flex-col justify-center h-full gap-2'>
							{routeList.map((route: RouteProps, i) => (
								<Link
									rel='noreferrer noopener'
									href={route.href}
									key={i}
									className={`text-[17px] ${buttonVariants({
										variant: "ghost",
									})}`}
								>
									{route.label}
								</Link>
							))}
							{isAuthenticated && isSubscribed && (
								<Link
									rel='noreferrer noopener'
									href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_URL!}
									target='_blank'
									className={`text-[17px] ${buttonVariants({
										variant: "ghost",
									})}`}
								>
									Billing Portal
								</Link>
							)}
						</nav>
						
						<DrawerFooter>
							{isAuthenticated && isSubscribed && (
								<Link
									rel='noreferrer noopener'
									href='/premium'
									// shining animated button with purple gradient
									className={`border bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white ${buttonVariants(
										{
											variant: "secondary",
										}
									)}`}
								>
									Premium ✨
								</Link>
							)}
							{isAuthenticated && (
								<Link
									rel='noreferrer noopener'
									href='/api/auth/logout'
									className={`border ${buttonVariants({ variant: "secondary" })}`}
								>
									Logout
									<LogOut className='w-4 h-4 ml-2' />
								</Link>
							)}
							{!isAuthenticated && (
								<Link
									rel='noreferrer noopener'
									href='/api/auth/login'
									className={`border ${buttonVariants({ variant: "secondary" })}`}
								>
									Login
								</Link>
							)}							
						</DrawerFooter>
					</DrawerContent>
					</Drawer>
				</div>				
			) }
		</header>
	);
};
