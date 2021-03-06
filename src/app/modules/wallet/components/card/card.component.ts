import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Asset } from '@app/models';
import { environment } from '@environment';
import {
  selectAssetsInfo
} from '@app/store/selectors/wallet-state.selectors';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { globalConsts } from '@app/consts';
import { ObservableInput } from "ngx-observable-input";

export interface Contact {
  assetData: {}
  asset_id: number
  available: number
  available_str: string
  iconUrl: string
  maturing: number
  maturing_str: string
  receiving: number
  receiving_str: string
  sending: number
  sending_str: string,
  isDetailsVisible: boolean
}

export enum selectorTitles {
  BALANCE = 'BALANCE',
  ASSET_INFO = 'ASSET INFO'
}

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @ObservableInput() @Input("status") public status$: Observable<any>;

  @ViewChild('card', {static: true}) card: ElementRef;
  assets$: Observable<any>;
  iconUrl: string;
  grothsValue: number;
  values: Contact[];

  public selectorTitlesData = selectorTitles;
  public selectorActiveTitle = selectorTitles.BALANCE;
  public isDetailsVisible: boolean;

  constructor(private store: Store<any>) {
    this.assets$ = this.store.pipe(select(selectAssetsInfo));
    this.grothsValue = globalConsts.GROTHS_IN_BEAM;
    this.isDetailsVisible = false;
    this.values = [];
  }

  private hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
              ,(m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g).map(x => parseInt(x, 16))

  ngOnInit(): void {
    this.status$.subscribe(status => {
      if (status.totals.length > 0) {
        let data = status.totals.map(value => {
          value['iconUrl'] = `${environment.assetsPath}/images/modules/wallet/components/card/${
            value.asset_id === 0 ? 'icon-beam' : ('asset-' + value.asset_id)}.svg`;
          this.assets$.subscribe(assets => {
            const asset = assets.find(elem => elem.asset_id === value.asset_id);
            if (asset) {
              value['assetData'] = asset.metadata;
              if (asset.metadata.color) {
                const rgbaValues = this.hexToRgb(asset.metadata.color);
                value['bgStyle'] = 'linear-gradient(107deg, rgba(' + 
                  rgbaValues.join(',') + ', .3) 2%, rgba(0, 69, 143, .3) 98%)'  ;
              }
            } else {
              value['assetData'] = {'unit_name': 'BEAM'}
            }
          }).unsubscribe();

          
          if (this.values.length > 0) {
            let prev = this.values.find(val => { return val.asset_id === value.asset_id });
            value['isDetailsVisible'] = prev && prev.isDetailsVisible !== undefined ? prev.isDetailsVisible : false;
          }  

          return value;
        });

        this.values = data;
      }
    });
  }

  public websiteClicked(link: string) {
    window.open(link, "_blank");
  }

  public showDetails(asset) {
    asset.isDetailsVisible = !asset.isDetailsVisible;
  }

  public hideDetails(asset) {
    asset.isDetailsVisible = false;
    this.selectorActiveTitle = this.selectorTitlesData.BALANCE;
  }

  public assetInfoClicked(asset) {
      this.selectorActiveTitle = this.selectorTitlesData.ASSET_INFO;
  }

  public balanceClicked(asset) {
    this.selectorActiveTitle = this.selectorTitlesData.BALANCE;
  }
}
