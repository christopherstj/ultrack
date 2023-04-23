export const mpsToMinsPerMile = (mps: number) => 26.8224 / mps;
export const minsPerMileToMps = (mins: number) => 26.8224 / mins;

export const formatDateForQuery = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
