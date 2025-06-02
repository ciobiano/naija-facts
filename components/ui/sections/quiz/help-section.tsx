import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HelpSection() {
	const steps = [
		{
			number: 1,
			title: "Start with Chapter I",
			description:
				"Begin your constitutional journey with the foundational chapter",
			bgColor: "bg-blue-100",
			textColor: "text-blue-600",
		},
		{
			number: 2,
			title: "Progress Sequentially",
			description:
				"Each chapter unlocks after you attempt questions in the previous one",
			bgColor: "bg-green-100",
			textColor: "text-green-600",
		},
		{
			number: 3,
			title: "Track Your Mastery",
			description: "Monitor your progress and improve your scores over time",
			bgColor: "bg-purple-100",
			textColor: "text-purple-600",
		},
	];

	return (
		<Card className="mt-8">
			<CardHeader>
				<CardTitle>How It Works</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid md:grid-cols-3 gap-6 text-sm">
					{steps.map((step) => (
						<div key={step.number} className="flex items-start space-x-3">
							<div
								className={`w-8 h-8 ${step.bgColor} ${step.textColor} rounded-full flex items-center justify-center font-bold`}
							>
								{step.number}
							</div>
							<div>
								<h4 className="font-medium mb-1">{step.title}</h4>
								<p className="text-muted-foreground">{step.description}</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
