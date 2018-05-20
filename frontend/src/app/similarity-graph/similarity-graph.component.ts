import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as Cytoscape from 'cytoscape';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-similarity-graph',
  templateUrl: './similarity-graph.component.html',
  styleUrls: ['./similarity-graph.component.css']
})
export class SimilarityGraphComponent implements OnInit, AfterViewInit {
    private cy;
    public industries;

    ngAfterViewInit() {
        this.buildGraph();
    }

    constructor() {
        this.industries = [
            {
                name: 'Automobiles & Components',
                visible: true,
                correlation: {
                    'Banks': 1,
                    'Capital Goods': 2,
                    'Class Pend': 1,
                    'Commercial & Professional Services': 1,
                    'Consumer Durables & Apparel': 1,
                    'Consumer Services': 3
                }
            },
            {
                name: 'Banks',
                visible: true,
                correlation: {
                    'Automobiles & Components': 1,
                    'Capital Goods': 1,
                    'Class Pend': 3,
                    'Commercial & Professional Services': 1,
                    'Consumer Durables & Apparel': 2,
                    'Consumer Services': 1
                }
            },
            {
                name: 'Capital Goods',
                visible: true,
                correlation: {
                    'Banks': 1,
                    'Automobiles & Components': 1,
                    'Class Pend': 2,
                    'Commercial & Professional Services': 1,
                    'Consumer Durables & Apparel': 1,
                    'Consumer Services': 3
                }
            },
            {
                name: 'Class Pend',
                visible: true,
                correlation: {
                    'Banks': 1,
                    'Automobiles & Components': 1,
                    'Capital Goods': 1,
                    'Commercial & Professional Services': 3,
                    'Consumer Durables & Apparel': 1,
                    'Consumer Services': 1
                }
            },
            {
                name: 'Commercial & Professional Services',
                visible: false,
                correlation: {
                    'Banks': 2,
                    'Automobiles & Components': 1,
                    'Capital Goods': 2,
                    'Class Pend': 2,
                    'Consumer Durables & Apparel': 1,
                    'Consumer Services': 1
                }
            },
            {
                name: 'Consumer Durables & Apparel',
                visible: false,
                correlation: {
                    'Banks': 1,
                    'Automobiles & Components': 3,
                    'Capital Goods': 2,
                    'Class Pend': 1,
                    'Commercial & Professional Services': 2,
                    'Consumer Services': 1
                }
            },
            {
                name: 'Consumer Services',
                visible: false,
                correlation: {
                    'Banks': 2,
                    'Automobiles & Components': 1,
                    'Capital Goods': 3,
                    'Class Pend': 3,
                    'Commercial & Professional Services': 1,
                    'Consumer Durables & Apparel': 1
                }
            }
        ];
    }

    buildGraph() {
        const myNodes = [];
        const myEdges = [];
        const corrToClass = {
            1: 'weak',
            2: 'normal',
            3: 'strong'
        };
        for (let i = 0 ; i < this.industries.length; i++) {
            if (this.industries[i].visible) {
                // add to nodes
                myNodes.push({ data: { id: this.industries[i].name, name: this.industries[i].name } });
                for (let j = 0 ; j < this.industries.length; j++) {
                    if (i === j) { continue; }
                    if (this.industries[j].visible) {
                        // add to edges
                        const myclass = corrToClass[this.industries[i].correlation[this.industries[j].name]];
                        myEdges.push({ data: { source: this.industries[i].name, target: this.industries[j].name }, classes: myclass });
                    }
                }
            }
        }

        this.cy = Cytoscape({container: document.getElementById('cy-graph'),
        elements: {
            nodes: myNodes,
            edges: myEdges
          },
          layout: {
            name: 'grid',
            padding: 10
          }
        });

        this.cy.style()
            .selector('node')
            .css({
                'content': 'data(name)',
                'text-valign': 'center',
                'color': 'white',
                'text-outline-width': 2,
                'background-color': '#555',
                'text-outline-color': '#555'
            })
            .selector('edge')
            .css({
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#ffcc5c',
                'line-color': '#ffcc5c',
                'width': 2
            })
            .selector('edge.strong')
            .css({
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#96ceb4',
                'line-color': '#96ceb4',
                'width': 3
            })
            .selector('edge.weak')
            .css({
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'target-arrow-color': '#ff6f69',
                'line-color': '#ff6f69',
                'width': 1
            })
            .selector(':selected')
            .css({
                'background-color': 'black',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'source-arrow-color': 'black'
            })
            .selector('.faded')
            .css({
                'opacity': 0.25,
                'text-opacity': 0
            })
        .update();

        // leave the next 3 lines alone, it can't be done through the css files
        // they do cause error messages but it is fine
        (<HTMLCanvasElement>document.getElementById('cy-graph').childNodes[0].childNodes[0]).style.left = '0px';
        (<HTMLCanvasElement>document.getElementById('cy-graph').childNodes[0].childNodes[1]).style.left = '0px';
        (<HTMLCanvasElement>document.getElementById('cy-graph').childNodes[0].childNodes[2]).style.left = '0px';
    }

    ngOnInit() {
    }

}
