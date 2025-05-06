// for page navigation & to sort on leftbar

export type EachRoute = {
	title: string;
	href: string;
	noLink?: true; // noLink will create a route segment (section) but cannot be navigated
	items?: EachRoute[];
	tag?: string;
};

export const ROUTES: EachRoute[] = [
	{
		title: "Getting Started",
		href: "/getting-started",
		noLink: true,
		items: [
			{
				title: "Chapter I",
				href: "/chapter-1",
				items: [
					{ title: "Part 1: Federal Republic of Nigeria ", href: "/part-1" },
					{
						title: "Part 2: Powers of the Federal Republic of Nigeria ",
						href: "/part-2",
					},
				],
			},
			{
				title: "Chapter II",
				href: "/chapter-2",
			},
			{ title: "Chapter III", href: "/chapter-3" },
			{
				title: "Chapter IV",
				href: "/chapter-4",
			},
			{
				title: "Chapter V",
				href: "/chapter-5",
				noLink: true,
				items: [
					{ title: "Part I", href: "/part-1" },
					{ title: "Part II", href: "/part-2" },
				],
			},
			{
				title: "Chapter VI",
				href: "/chapter-6",
				noLink: true,
				items: [
					{ title: "Part I", href: "/part-1" },
					{ title: "Part II", href: "/part-2" },
					{ title: "Part III", href: "/part-3" },
				],
			},
			{
				title: "Chapter VII",
				href: "/chapter-7",
				tag: "updated",
				noLink: true,

				items: [
					{ title: "Part I", href: "/part-1" },
					{ title: "Part II", href: "/part-2" },
					{ title: "Part III", href: "/part-3" },
					{ title: "Part IV", href: "/part-4" },
				],
			},
			{
				title: "Chapter VIII",
				href: "/chapter-8",
				noLink: true,
				items: [
					{ title: "Part I", href: "/part-1" },
					{ title: "Part II", href: "/part-2" },
					{ title: "Part III", href: "/part-3" },
					{ title: "Part IV", href: "/part-4" },
				],
			},
			{
				title: "Schedule",
				href: "/schedule",
				noLink: true,
				items: [
					{ title: "First Schedule", href: "/first-schedule",
						
					 },
					{ title: "Second Schedule", href: "/second-schedule" },
					{ title: "Part III", href: "/part-3" },
					{ title: "Part IV", href: "/part-4" },
					{ title: "Part V", href: "/part-5" },
				]
			},
		],
	},
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
	const ans: Page[] = [];
	if (!node.noLink) {
		``;
		ans.push({ title: node.title, href: node.href });
	}
	node.items?.forEach((subNode) => {
		const temp = { ...subNode, href: `${node.href}${subNode.href}` };
		ans.push(...getRecurrsiveAllLinks(temp));
	});
	return ans;
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
