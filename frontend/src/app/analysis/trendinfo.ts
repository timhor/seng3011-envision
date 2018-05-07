export class TrendInfo {
  rawQuery: Object;
  shortRangeCorrelation: number;
  longRangeCorrelation: number;
  analysis: string;
  cumulativeReturn: number;
  relatedCompanies: string[];
  hidden = true;
  error = false;
}
