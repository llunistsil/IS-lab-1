import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Redirect } from './constants/redirect-to-map';
import { ActivatedRoute, Router } from '@angular/router';
import { TuiButton, TuiLink } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, TuiLink, TuiBlockStatus, TuiButton, NgOptimizedImage],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.less'
})
export class NotFoundComponent implements OnInit {
  private redirectUrl: Redirect | null = null;
  private restQueryParams = {};

  constructor(
    private router: Router, private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    const params = this.activatedRoute.snapshot.queryParams;
    const { redirectTo, ...queryParams } = params;

    this.redirectUrl = redirectTo ?? Redirect.Main;
    this.restQueryParams = queryParams;
  }

  public goToMainPage(): void {
    if (!this.redirectUrl && !Object.keys(this.restQueryParams).length) {
      this.router.navigate(['']);
      return;
    }

    this.router.navigate([this.redirectUrl], {
      queryParams: this.restQueryParams,
    });
  }
}
