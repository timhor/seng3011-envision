export class TrendInfo {
  // Raw API info
  rawQuery: Object;

  // Analysis info
  cumulativeReturn: number;
  longRangeCorrelation: number;
  shortRangeCorrelation: number;

  // Other displayed info
  relatedCompanies: string[];
  analysis: string;

  // Utility info
  hidden = true;
  error = false;
}
