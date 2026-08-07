import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-placeholder',
  template: `
    <section class="page-card">
      <p class="eyebrow">Base del panel</p>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </section>
  `,
})
export class PagePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = String(this.route.snapshot.data['title'] ?? 'Próximamente');
  readonly description = String(
    this.route.snapshot.data['description'] ??
      'Esta sección se implementará en la siguiente fase visual.',
  );
}
