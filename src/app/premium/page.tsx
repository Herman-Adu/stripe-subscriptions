

"use server";

import { Hero } from "@/components/Hero";
import prisma from "@/db/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
	const { getUser } = getKindeServerSession();
	const user = await getUser();

	if (!user) return redirect("/")

	const userProfile = await prisma.user.findUnique({ where: { id: user.id}})

	if (userProfile?.plan === "free") return redirect("/")


	return (
		<main>
			<Hero />
			<section id='premium' className='container sm:py-2'>
				<h2 className='text-3xl md:text-4xl font-bold text-left mb-4'>
					Premium 
					<span className='bg-gradient-to-b from-[#667EEA] to-[#764BA2] uppercase text-transparent bg-clip-text'>
						{" "}
						Content{" "}
					</span>
				</h2>
				<p>
					Welcome, you are on the premium plan, so you can see this page
				</p>
			</section>
		</main>
	)
};
export default Page;
