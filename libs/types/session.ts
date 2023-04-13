export interface Session {
    avgSpeed: number;
    avgStanceTime: number;
    avgStanceTimeBalance: number;
    avgStepLength: number;
    avgVerticalOscillation: number;
    avgVerticalRatio: number;
    enhancedAvgSpeed: number;
    enhancedMaxSpeed: number;
    maxCadence: number;
    maxHeartRate: number;
    maxRunningCadence: number;
    maxSpeed: number;
    minHeartRate: number;
    sport: string;
    startTime: Date;
    subSport: string;
    timestamp: Date;
    totalAscent: number;
    totalCalories: number;
    totalCycles: number;
    totalDescent: number;
    totalDistance: number;
    totalElapsedTime: number;
    totalStrides: number;
    totalTimerTime: number;
}
