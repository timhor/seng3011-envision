import { Component, OnInit } from '@angular/core';
import { CallerService } from '../caller.service';
import { Router } from '@angular/router';
import { TrendInfo } from './trendinfo';
import { HttpParams } from '@angular/common/http';
import { NewsInfo } from '../newsinfo';
import { Chart } from 'chart.js';
import { createText } from '@angular/core/src/view/text';
import { AnalysisDialogComponent } from '../analysis-dialog/analysis-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  public newsInfo: NewsInfo = null;
  public trendInfo: TrendInfo = null;
  public showingOverview = true;
  public showingGraph1 = false;
  public showingGraph2 = false;
  public graph_type;
  public rtn_data;
  public rtn_options;
  public cm_rtn_data;
  public cm_rtn_options;
  public positiveSummary = false;
  public loadingReturnsPct = true;
  public loadingCMReturnsPct = true;

  public factors: any[];
  public summary: string;
  public summaryHelp: string;
  public generalInfo = 'General Info';
  public generalInfoHelp =
`<ul>
  <li>
    <strong>Summary:</strong> An overall summary based off the given factors.
  </li>
  <li>
    <strong>Cumulative Returns:</strong> Cumulative return to show the change in returns during the analysis window.
  </li>
  <li>
    <strong>Correlation:</strong> Calculated using Pearson's Correlation Coefficient – the covariance between the stock and
    the industry divided by the product of variances.</li>
</ul>
`;

public overallMetric: number;

  constructor(
    private callerService: CallerService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.newsInfo = this.callerService.getAnalysisInfo();
    if (this.newsInfo === null) {
      this.router.navigate(['home']);
    }
    this.trendInfo = this.analyseTrends(this.newsInfo.instrument, this.newsInfo.date);
    this.factors = [
      {
        name: 'Cumulative Returns',
        value: true,
        help:
`<p>Cumulative return to show the change in returns during the analysis window.</p>
<p>Indicators:</p>
<ul>
  <li>
    <span class="positive">BUY:</span> The cumulative returns are very positive and this would have been a good buy.
  </li>
  <li>
    <span class="neutral">HOLD:</span> The cumulative returns did not shift large enough to be considered for movement.
  </li>
  <li>
    <span class="negative">SELL:</span> The cumulative returns are very negative and would have been a good choice to sell.
  </li>
</ul>
<br>
`,
        factor: 1,
        metric: 0
      },
      {
        name: '5-day Correlation',
        value: true,
        help:
`<p>Calculated using Pearson's Correlation Coefficient to determine the short term correlation.</p>
<p>Indicators:</p>
<ul>
  <li>
    <span class="positive">BUY:</span> The stock moved generally in line with its respective index, which generally indicates good health.
  </li>
  <li>
    <span class="neutral">HOLD:</span> The stock did not correlate much with its index, so the correlation is not a useful measure.
  </li>
  <li>
    <span class="negative">SELL:</span> The stock moved inversely with its respective index, which is generally a sign of an issue.
  </li>
</ul>
<br>
`,
        factor: 1,
        metric: 0
      },
      {
        name: '20-day Correlation',
        value: true,
        help:
`Calculated using Pearson\'s Correlation Coefficient to determine the long term correlation.
<p>Indicators:</p>
<ul>
  <li>
    <span class="positive">BUY:</span> The stock moved generally in line with its respective index, which generally indicates good health.
  </li>
  <li>
    <span class="neutral">HOLD:</span> The stock did not correlate much with its index, so the correlation is not a useful measure.
  </li>
  <li>
    <span class="negative">SELL:</span> The stock moved inversely with its respective index, which is generally a sign of an issue.
  </li>
</ul>
<br>
`,
        factor: 1,
        metric: 0
      },
      {
        name: 'Volume Flow',
        value: true,
        help:
`Calculated by comparing the proportion of volume within the first 5 days of the news compared to the relative 20-day range.
<p>Indicators:</p>
<ul>
  <li>
    <span class="positive">BUY:</span> The stock had a high volume flow, meaning that it was highly traded right after the news story.
  </li>
  <li>
    <span class="neutral">HOLD:</span> The stock traded in normal trading capacity, so this measure is not relevant.
  </li>
  <li>
    <span class="negative">SELL:</span> The stock had lower than normal volume flow, meaning that it has been stale since the news story.
  </li>
</ul>
<br>
`,
        factor: 1,
        metric: 0
      }
    ];
    this.summary = 'Summary';
    this.summaryHelp = 'help text for Summary';
  }

  private analyseTrends(company: string, date: string) {
    const trendInfo = new TrendInfo();
    const companyCode = this.callerService.getCompanyCode(company);
    if (companyCode == null) {
      return;
    }

    const index: string = this.callerService.getStockIndex(companyCode);
    let params: HttpParams = new HttpParams();
    params = params.append('instrument_id', companyCode + '.AX,' + index);

    const splitDate: string[] = date.split('/');
    const tempDate = splitDate[2] + '-' + splitDate[1] + '-' + splitDate[0];
    params = params.append('date_of_interest', tempDate);

    this.callerService.getStockInfo(params).subscribe((result) => {
      trendInfo.rawQuery = result;
      console.log(result);
      let indexTS: Array<any>;
      let companyTS: Array<any>;

      // handle alpha vantage error
      if (result['Metadata']['success'] === false) {
        trendInfo.cumulativeReturn = 0;
        trendInfo.longRangeCorrelation = 0;
        trendInfo.shortRangeCorrelation = 0;
        trendInfo.analysis = 'error';
        trendInfo.hidden = false;
        trendInfo.error = false;
        return trendInfo;
      }

      let i: number;
      let array: number[];
      const volume: number[] = [];
      for (i = 0; i < 2; i++) {
        array = [];
        try {
          result['Company_Returns'][i]['Data'].forEach(e => {
            array.push(e['Return_pct']);
          });
          if (result['Company_Returns'][i]['InstrumentID'] === index) {
            indexTS = array;
          } else {
            companyTS = array;
            this.trendInfo.cumulativeReturn = result['Company_Returns'][i]['Data'][5]['CM_Return_pct'];
            result['Company_Returns'][i]['Data'].forEach(e => {
              volume.push(e['Volume']);
            });
          }
          // Pearson correlation coefficient
          trendInfo.longRangeCorrelation = this.getPearsonCorrelation(indexTS, companyTS);
          trendInfo.shortRangeCorrelation = this.getPearsonCorrelation(indexTS.slice(4, 15), companyTS.slice(4, 15));
          trendInfo.volumeFlow = this.calculateVolumeFlow(volume);
          trendInfo.analysis = this.stateAnalysis(trendInfo, this.trendInfo.cumulativeReturn);
          trendInfo.hidden = false;
          trendInfo.error = false;
          console.log(trendInfo);
        } catch (error) {
          trendInfo.analysis = 'Company stock information does not exist, sorry!';
          trendInfo.error = true;
        }
      }

      this.generateGraphs();
      this.determineBuySell();
    });

    trendInfo.relatedCompanies = this.callerService.getRelatedCompanies(company).slice(0, 5);
    return trendInfo;
  }

  determineBuySell() {
    if (this.trendInfo.cumulativeReturn <= -0.05) {
      this.factors[0].metric = -100;
    } else if (this.trendInfo.cumulativeReturn >= 0.05) {
      this.factors[0].metric = 100;
    } else {
      this.factors[0].metric = this.trendInfo.cumulativeReturn * 2000;
    }

    this.factors[1].metric = this.trendInfo.shortRangeCorrelation * 100;
    this.factors[2].metric = this.trendInfo.longRangeCorrelation * 100;

    if (this.trendInfo.volumeFlow < 0.1) {
      this.factors[3].factors = -100;
    } else if (this.trendInfo.volumeFlow > 0.4) {
      this.factors[3].factors = 100;
    } else {
      // 0.4 - 0.1 = 0.3
      this.factors[3].factors = (this.trendInfo.volumeFlow - 0.1) / 0.3 * 200 - 100;
    }

    let activeMetrics = 0;
    this.overallMetric = 0;
    this.factors.forEach(e => {
      if (e.value) {
        activeMetrics += 1;
        this.overallMetric += e.metric * e.factor;
      }
    });
    if (activeMetrics !== 0) {
      this.overallMetric /= activeMetrics;
      console.log('Overall metric is' + this.overallMetric);
    }
  }

  private calculateVolumeFlow(ts: number[]) {
    if (ts.length < 10) {
      return 0;
    }

    let immediate = 0;
    let total = 0;
    let count = 0;
    ts.forEach(data => {
      if (count >= 5 && count <= 10) {
        // Most recent 5 days, considered immediate after effect of the news story
        immediate += data;
      }
      total += data;
      count += 1;
    });
    if (total === 0) {
      return 0;
    }
    return immediate / total;
  }

  private generateGraphs() {
    const dates = [];

    const returnPercentageDatasets = [];
    const cmReturnPercentageDatasets = [];

    let returnPctData = [];
    let cmReturnPctData = [];

    let shouldDrawReturnsPct = false;
    let shouldDrawCMReturnsPct = false;

    this.loadingReturnsPct = true;
    this.loadingCMReturnsPct = true;

    const graphColors = ['#E76C51', '#23415B'];
    let counter = 0;
    // Populate data arrays
    this.trendInfo['rawQuery']['Company_Returns'].forEach(instrument => {
      // Convert API Data to Array
      returnPctData = [];
      cmReturnPctData = [];

      const instrumentColor: any = graphColors[counter];
      counter++;

      // Build set of colors with one point being different color
      const radiusSizes = [3, 3, 3, 3, 3, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

      instrument['Data'].forEach(rec => {
        if (rec['Return_pct'] !== undefined) {
          returnPctData.push(Number((rec['Return_pct'] * 100).toFixed(4)));
        }
        if (rec['CM_Return_pct'] !== undefined) {
          cmReturnPctData.push(Number((rec['CM_Return_pct'] * 100).toFixed(4)));
        }

        const mydate: Date = new Date(rec.Date);
        const formattedDate: string = mydate.toLocaleDateString();
        if (dates.indexOf(formattedDate) === -1) {
          dates.push(formattedDate);
        }
      });

      // Add datasets for percentage returns graph
      if (returnPctData.length > 0) {
        returnPercentageDatasets[instrument['InstrumentID']] = [];
        returnPercentageDatasets[instrument['InstrumentID']].push(
          {
            label: instrument['InstrumentID'],
            data: returnPctData,
            fill: false,
            borderColor: instrumentColor,
            lineTension: 0.1,
            radius: radiusSizes,
            backgroundColor: instrumentColor,
          }
        );
        shouldDrawReturnsPct = true;
      }

      if (cmReturnPctData.length > 0) {
        cmReturnPercentageDatasets[instrument['InstrumentID']] = new Array();
        cmReturnPercentageDatasets[instrument['InstrumentID']].push(
          {
            label: instrument['InstrumentID'],
            data: cmReturnPctData,
            fill: false,
            borderColor: instrumentColor,
            lineTension: 0.1,
            radius: radiusSizes,
            backgroundColor: instrumentColor,
          }
        );
        shouldDrawCMReturnsPct = true;
      }

      // Build returns percentage graph
      if (shouldDrawReturnsPct === true) {
        const dataArray = new Array();
        for (const key in returnPercentageDatasets) {
          if (returnPercentageDatasets[key]) {
            const val = returnPercentageDatasets[key];
            dataArray.push(val[0]);
          }
        }
        this.graph_type = 'line';
        this.rtn_data = {
          labels: dates,
          datasets: dataArray
        };
        this.rtn_options = this.buildGraphOptions('Returns Percentage', 'Returns (%)');
      }

      this.loadingReturnsPct = false;

      // Build CM returns percentage graph
      if (shouldDrawCMReturnsPct) {
        const dataArray = new Array();
        for (const key in cmReturnPercentageDatasets) {
          if (cmReturnPercentageDatasets[key]) {
            const val = cmReturnPercentageDatasets[key];
            dataArray.push(val[0]);
          }
        }
        this.graph_type = 'line';
        this.cm_rtn_data = {
          labels: dates,
          datasets: dataArray
        };
        this.cm_rtn_options = this.buildGraphOptions('CM Returns Percentage', 'Returns (%)');
      }

      this.loadingCMReturnsPct = false;

      return;
    });
  }

  private buildGraphOptions(name, yLabel) {
    const options = {
      responsive: true,
      title: {
        display: true,
        text: name
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Days'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: yLabel
          }
        }]
      },
      pan: {
        enabled: true,
        mode: 'x'
      },
      zoom: {
        enabled: true,
        mode: 'x',
        sensitivity: 3,
      }
    };
    return options;
  }

  private getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  private stateAnalysis(trendInfo: any, retPct: number) {
    const trend = retPct > 0 ? 1 : -1;

    let correlation: number;
    if (Math.abs(trendInfo.shortRangeCorrelation) > 0.8) {
      correlation = 2;
    } else if (Math.abs(trendInfo.shortRangeCorrelation) > 0.7) {
      correlation = 1;
    } else {
      correlation = 0;
    }

    let coincidenceIndex = false;
    if (Math.abs(trendInfo.longRangeCorrelation - trendInfo.shortRangeCorrelation) < 0.05) {
      // Check if the stock was moving inline with the index
      coincidenceIndex = true;
    }

    let outputString = '';
    if (trend === 1) {
      outputString += 'Positive growth ';
      this.positiveSummary = true;
    } else {
      outputString += 'Negative growth ';
      this.positiveSummary = false;
    }

    if (trendInfo.volumeFlow > 0.35) {
      outputString += 'while traded aggressively ';
    } else if (trendInfo.volumeFlow > 0.2) {
      outputString += 'while traded actively ';
    } else if (trendInfo.volumeFlow < 0.1) {
      outputString += 'while traded less frequently ';
    }

    switch (correlation) {
      case 1:
      outputString += 'with very high correlation to index';
      break;

      case 2:
      outputString += 'with high correlation';
      break;

      default:
      outputString += 'with low correlation to index';
      break;
    }

    if (coincidenceIndex) {
      outputString += ', however can be a coincidence as the trend was similar';
    }

    return outputString;
  }

  /*
  *  Source: http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
  */
  private getPearsonCorrelation(x, y) {
    let shortestArrayLength = 0;
    if ( x === undefined || y === undefined) {return 0; }

    if (x.length === y.length) {
      shortestArrayLength = x.length;
    } else if (x.length > y.length) {
      shortestArrayLength = y.length;
      console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
    } else {
      shortestArrayLength = x.length;
      console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
    }

    const xy = [];
    const x2 = [];
    const y2 = [];

    for (let i = 0; i < shortestArrayLength; i++) {
      xy.push(x[i] * y[i]);
      x2.push(x[i] * x[i]);
      y2.push(y[i] * y[i]);
    }

    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_x2 = 0;
    let sum_y2 = 0;

    for (let i = 0; i < shortestArrayLength; i++) {
      sum_x += x[i];
      sum_y += y[i];
      sum_xy += xy[i];
      sum_x2 += x2[i];
      sum_y2 += y2[i];
    }

    const step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
    const step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
    const step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
    const step4 = Math.sqrt(step2 * step3);
    const answer = step1 / step4;

    return answer;
  }

  public expandGraph1() {
    this.showingOverview = !this.showingOverview;
    this.showingGraph1 = !this.showingGraph1;
  }

  public expandGraph2() {
    this.showingOverview = !this.showingOverview;
    this.showingGraph2 = !this.showingGraph2;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AnalysisDialogComponent, {
      width: '1000px',
      disableClose: true,
      data: this.factors
    });

    dialogRef.afterClosed().subscribe(
      data => {
        this.factors = data;
        this.determineBuySell();
      }
    );
  }

  openHelp(title: string, help: string): void {
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: title,
        help: help
      }
    });
  }
}
