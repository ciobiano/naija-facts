"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Wifi,
	WifiOff,
	Zap,
	Clock,
	Download,
	Trash2,
	BarChart3,
	Signal,
	HardDrive,
} from "lucide-react";
import { useQuizPerformance } from "@/hooks/useQuizPerformance";
import { cn } from "@/lib/utils";

interface PerformanceIndicatorProps {
	className?: string;
	showDetailedMetrics?: boolean;
	onClearCache?: () => void;
}

export function PerformanceIndicator({
	className,
	showDetailedMetrics = false,
	onClearCache,
}: PerformanceIndicatorProps) {
	const {
		isOffline,
		isLoading,
		networkInfo,
		loadingStrategy,
		cacheHitRate,
		offlineCategories,
		clearCache,
		getPerformanceMetrics,
		isSlowConnection,
	} = useQuizPerformance({
		enablePerformanceMetrics: true,
	});

	const metrics = getPerformanceMetrics();

	const getNetworkIcon = () => {
		if (isOffline) return <WifiOff className="h-4 w-4" />;

		switch (networkInfo.connectionType) {
			case "slow-2g":
			case "2g":
				return <Signal className="h-4 w-4 text-red-500" />;
			case "3g":
				return <Signal className="h-4 w-4 text-yellow-500" />;
			case "4g":
			default:
				return <Wifi className="h-4 w-4 text-green-500" />;
		}
	};

	const getNetworkStatusText = () => {
		if (isOffline) return "Offline";
		return networkInfo.connectionType.toUpperCase();
	};

	const getNetworkStatusColor = () => {
		if (isOffline) return "destructive";
		if (isSlowConnection) return "destructive";
		if (networkInfo.connectionType === "3g") return "secondary";
		return "default";
	};

	const handleClearCache = () => {
		clearCache();
		onClearCache?.();
	};

	const formatLoadTime = (ms: number) => {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	};

	return (
		<TooltipProvider>
			<div className={cn("flex items-center gap-2", className)}>
				{/* Network Status Badge */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge
							variant={getNetworkStatusColor()}
							className="flex items-center gap-1 cursor-help"
						>
							{getNetworkIcon()}
							<span className="text-xs">{getNetworkStatusText()}</span>
							{isLoading && (
								<div className="w-2 h-2 bg-current rounded-full animate-pulse" />
							)}
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<div className="text-sm">
							<p className="font-medium">Network Status</p>
							<p>Type: {networkInfo.connectionType}</p>
							<p>Speed: {networkInfo.downlink} Mbps</p>
							<p>Latency: {networkInfo.rtt}ms</p>
							{isOffline && (
								<p className="text-red-500 mt-1">
									Using offline data ({offlineCategories.length} categories
									available)
								</p>
							)}
						</div>
					</TooltipContent>
				</Tooltip>

				{/* Performance Metrics */}
				{showDetailedMetrics && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-1"
							>
								<BarChart3 className="h-4 w-4" />
								<span className="text-xs">Performance</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-64">
							<div className="p-3 space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Performance Metrics
									</span>
									<Badge variant="outline" className="text-xs">
										Live
									</Badge>
								</div>

								{/* Cache Performance */}
								<div className="space-y-2">
									<div className="flex items-center justify-between text-xs">
										<span className="flex items-center gap-1">
											<Zap className="h-3 w-3" />
											Cache Hit Rate
										</span>
										<span className="font-mono">
											{(cacheHitRate * 100).toFixed(1)}%
										</span>
									</div>
									<Progress value={cacheHitRate * 100} className="h-1" />
								</div>

								{/* Load Time */}
								<div className="flex items-center justify-between text-xs">
									<span className="flex items-center gap-1">
										<Clock className="h-3 w-3" />
										Avg Load Time
									</span>
									<span className="font-mono">
										{formatLoadTime(metrics.averageLoadTime)}
									</span>
								</div>

								{/* Offline Storage */}
								<div className="flex items-center justify-between text-xs">
									<span className="flex items-center gap-1">
										<HardDrive className="h-3 w-3" />
										Offline Categories
									</span>
									<span className="font-mono">
										{metrics.offlineCategoriesCount}
									</span>
								</div>

								{/* Error Count */}
								{metrics.errorCount > 0 && (
									<div className="flex items-center justify-between text-xs">
										<span className="text-red-600">Errors</span>
										<span className="font-mono text-red-600">
											{metrics.errorCount}
										</span>
									</div>
								)}

								<DropdownMenuSeparator />

								{/* Loading Strategy */}
								<div className="text-xs">
									<span className="text-muted-foreground">Strategy:</span>
									<span className="ml-1 capitalize">
										{loadingStrategy.type} ({loadingStrategy.batchSize} batch)
									</span>
								</div>

								<DropdownMenuSeparator />

								{/* Actions */}
								<DropdownMenuItem
									onClick={handleClearCache}
									className="flex items-center gap-2 text-xs"
								>
									<Trash2 className="h-3 w-3" />
									Clear Cache
								</DropdownMenuItem>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				{/* Simple Cache Indicator */}
				{!showDetailedMetrics && cacheHitRate > 0 && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Badge
								variant="outline"
								className="flex items-center gap-1 text-xs"
							>
								<Zap className="h-3 w-3" />
								{(cacheHitRate * 100).toFixed(0)}%
							</Badge>
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-sm">
								Cache hit rate: {(cacheHitRate * 100).toFixed(1)}%
							</p>
						</TooltipContent>
					</Tooltip>
				)}

				{/* Offline Indicator */}
				{isOffline && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Badge
								variant="secondary"
								className="flex items-center gap-1 text-xs"
							>
								<Download className="h-3 w-3" />
								{offlineCategories.length}
							</Badge>
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-sm">
								{offlineCategories.length} categories available offline
							</p>
						</TooltipContent>
					</Tooltip>
				)}

				{/* Loading Indicator */}
				{isLoading && (
					<div className="flex items-center gap-1">
						<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
						<span className="text-xs text-muted-foreground">Loading...</span>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}
