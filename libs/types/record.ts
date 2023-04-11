export interface Record {
    activityType: string;
    altitude?: number;
    cadence?: number;
    developerFields?: any;
    distance?: number;
    enhancedAltitude?: number;
    enhancedSpeed?: number;
    heartRate?: number;
    positionLat?: number;
    positionLong?: number;
    speed?: number;
    stepLength?: number;
    timestamp: Date;
    percentGrade?: number;
}
