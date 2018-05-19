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

  constructor(private callerService: CallerService, private router: Router, public dialog: MatDialog) {
    this.factors = [
      {
        name: 'Cumulative Returns',
        value: true,
        help: 'help text for Cumulative Returns'
      },
      {
        name: '5-day Correlation',
        value: true,
        help: 'help text for 5-day Correlation'
      },
      {
        name: '20-day Correlation',
        value: true,
        help: 'help text 20-day Correlation'
      }
    ];
    this.summary = 'Summary';
    this.summaryHelp = 'help text for Summary';
  }

  ngOnInit() {
    this.newsInfo = this.callerService.getAnalysisInfo();
    if (this.newsInfo === null) {
      this.router.navigate(['home']);
    }
    this.trendInfo = this.analyseTrends(this.newsInfo.instrument, this.newsInfo.date);
  }

  private analyseTrends(company: string, date: string) {
    const trendInfo = new TrendInfo();
    const companyCode = this.callerService.getCompanyCode(company);
    if (companyCode == null) {
      return;
    }

    const index: string = this.callerService.getStockIndex(companyCode);
    let params: HttpParams = new HttpParams();
    params = params.append('instrument_id', companyCode + ',' + index);

    const splitDate: string[] = date.split('/');
    const tempDate = splitDate[2] + '-' + splitDate[0] + '-' + splitDate[1];
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
          }
          // Pearson correlation coefficient
          trendInfo.longRangeCorrelation = this.getPearsonCorrelation(indexTS, companyTS);
          trendInfo.shortRangeCorrelation = this.getPearsonCorrelation(indexTS.slice(4, 15), companyTS.slice(4, 15));
          trendInfo.analysis = this.stateAnalysis(trendInfo);
          trendInfo.hidden = false;
          trendInfo.error = false;
          console.log(trendInfo);
        } catch (error) {
          trendInfo.analysis = 'Company stock information does not exist, sorry!';
          trendInfo.error = true;
        }
      }
      // Pearson correlation coefficient
      trendInfo.longRangeCorrelation = this.getPearsonCorrelation(indexTS, companyTS);
      trendInfo.shortRangeCorrelation = this.getPearsonCorrelation(indexTS.slice(4, 15), companyTS.slice(4, 15));
      trendInfo.analysis = this.stateAnalysis(trendInfo);
      trendInfo.hidden = false;

      this.generateGraphs();
      console.log('This trendInfo' + this.trendInfo);
      console.log(trendInfo);
    });

    trendInfo.relatedCompanies = this.callerService.getRelatedCompanies(company).slice(0, 5);
    return trendInfo;
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

    // Populate data arrays
    this.trendInfo['rawQuery']['Company_Returns'].forEach(instrument => {
      // Convert API Data to Array
      returnPctData = [];
      cmReturnPctData = [];

      const instrumentColor: any = this.getRandomColor();

      instrument['Data'].forEach(rec => {
        if (rec['Return_pct'] !== undefined) {
          console.log('Checking: ' + Number((rec['Return_pct'] * 100).toFixed(4)));
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


  private stateAnalysis(trendInfo: any) {
    const companyIndex = trendInfo.rawQuery['Company_Returns'][0]['InstrumentID'].includes('^') ? 0 : 1;
    const trend = trendInfo.rawQuery['Company_Returns'][companyIndex]['Data'][5]['CM_Return_pct'] > 0 ? 1 : -1;

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
      data => this.factors = data
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
