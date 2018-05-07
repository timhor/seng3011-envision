import { Component, OnInit } from '@angular/core';
import { CallerService } from '../caller.service';
import { Router } from '@angular/router';
import { TrendInfo } from './trendinfo';
import { HttpParams } from '@angular/common/http';
import { NewsInfo } from '../newsinfo';
import { Chart } from '../../assets/Chart.bundle.min.js';
import { createText } from '@angular/core/src/view/text';


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

  constructor(private callerService: CallerService, private router: Router) {}

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

    // HACK: Please fix properly after
    const tempDate = date.split('/').reverse().join('-');
    params = params.append('date_of_interest', tempDate);

    this.callerService.getStockInfo(params).subscribe((result) => {
      trendInfo.rawQuery = result;
      let indexTS: Array<any>;
      let companyTS: Array<any>;

      let i: number;
      let array: number[];
      for (i = 0; i < 2; i++) {
        array = [];
        result['Company_Returns'][i]['Data'].forEach(e => {
          array.push(e['Return_pct']);
        });
        if (result['Company_Returns'][i]['InstrumentID'] === index) {
          indexTS = array;
        } else {
          companyTS = array;
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
    return trendInfo;

  }

  private generateGraphs() {
    let dates: Array<any>;

    let returnPercentageDatasets: Array<any>;
    let cmReturnPercentageDatasets: Array<any>;

    let returnPctData: Array<any>;
    let cmReturnPctData: Array<any>;

    let shouldDrawCMReturnsPct = false;
    let shouldDrawReturnsPct = false;

    // Populate data arrays
    this.trendInfo['rawQuery']['Company_Returns'].forEach(instrument => {
      // Convert API Data to Array
      returnPctData = null;
      cmReturnPctData = null;

      let instrumentColor: any = this.getRandomColor();

      instrument['Data'].forEach(rec => {
        if (rec['Return_pct'] !== undefined) {
          console.log('Checking: ' + Number((rec.Return_pct * 100).toFixed(4)));
          returnPctData.push(Number((rec.Return_pct * 100).toFixed(4)));
        }
        if (rec.CM_Return_pct !== undefined) {
          cmReturnPctData.push(Number((rec.CM_Return_pct * 100).toFixed(4)));
        }

        let mydate: Date = new Date(rec.Date);
        let formattedDate: string = mydate.toLocaleDateString();
        if (dates.indexOf(formattedDate) === -1) {
          dates.push(formattedDate);
        }
      });

      // Add datasets for percentage returns graph
      if (returnPctData.length > 0) {
        returnPercentageDatasets[instrument['InstrumentID']] = null;
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
        cmReturnPercentageDatasets[instrument.InstrumentID] = new Array();
        cmReturnPercentageDatasets[instrument.InstrumentID].push(
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
        let ctx = <HTMLCanvasElement> document.getElementById('returnsGraph');
        let context = ctx.getContext('2d');
        let rtnPctChart = new Chart(
          context,
          this.buildGraphData(dates, returnPercentageDatasets, this.buildGraphOptions('Returns Percentage', 'Returns (%)'))
        );
      }


      // Build CM returns percentage graph
      if (shouldDrawCMReturnsPct) {
        let ctx = <HTMLCanvasElement> document.getElementById('cmReturnsGraph');
        let context = ctx.getContext('2d');
        let cmRtnPctChart = new Chart(
          context,
          this.buildGraphData(dates, cmReturnPercentageDatasets, this.buildGraphOptions('Cumulative Returns Percentage', 'Returns (%)'))
        );
      }
      return;
    });
  }

  private buildGraphData(dates: Array<any>, datasets: Array<any>, graphOptions: any) {
      let dataArray = new Array();
      datasets.forEach((val) => {
        dataArray.push(val[0]);
      });
      // jQuery.each(datasets, (i,val) => {
      //     dataArray.push(val[0]);
      // });
      return {
          type: 'line',
          data: {
              labels: dates,
              datasets: dataArray
          },
          options: graphOptions
      };
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
    const trend = trendInfo.rawQuery['Company_Returns'][0]['Data'][5]['CM_Return_pct'] > 0 ? 1 : -1;

    let correlation: number;
    if (Math.abs(trendInfo.shortRangeCorrelation) > 0.8) {
      correlation = 2;
    } else if (Math.abs(trendInfo.shortRangeCorrelation) > 0.7) {
      correlation = 1;
    } else {
      correlation = 0;
    }

    let coincidenceIndex = false;
    if (Math.abs(trendInfo.longRangeCorrelation - trendInfo.shortRangeCorrelation) < 0.1) {
        // Check if the stock was moving inline with the index
        coincidenceIndex = true;
    }

    let outputString = '';
    if (trend === 1) {
      outputString += 'Positive growth ';
    } else {
      outputString += 'Negative growth ';
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
}
