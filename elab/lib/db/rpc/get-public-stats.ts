import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const getCachedPublicStats = unstable_cache(
	async () => {
		const [schools, students] = await Promise.all([
			prisma.school.count(),
			prisma.userRole.count({ where: { role: "student" } }),
		]);
		return { schools, students, experiments: 0 };
	},
	["public-stats"],
	{ revalidate: 60 },
);

export async function getPublicStats() {
	return getCachedPublicStats();
}
