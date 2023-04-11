export interface Lap {
    avgRunningCadence: number;
    avgSpeed: number;
    avgStanceTime: number;
    avgStanceTimePercent: number;
    avgStepLength: number;
    avgTemperature: number;
    avgVerticalOscillation: number;
    avgVerticalRatio: number;
    developerFields: any;
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
    totalDescent: number;
    totalDistance: number;
    totalElapsedTime: number;
    totalTimerTime: number;
}
