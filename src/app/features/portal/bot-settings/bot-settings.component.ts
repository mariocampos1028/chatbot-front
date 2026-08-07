import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { BotConfiguration, BotFaq, BotServiceItem, BotTone } from '../portal.models';
import { PortalService } from '../portal.service';

@Component({
  selector: 'app-bot-settings',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Comportamiento del chatbot</p>
        <h2>Configurar bot</h2>
        <p>Usa formularios simples. El sistema genera internamente las instrucciones técnicas.</p>
      </div>
    </section>

    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    } @else if (!configuration()) {
      <p class="loading">Cargando configuración del bot…</p>
    } @else {
      <form class="panel form-grid" [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
        <div class="panel-title full-width">
          <div>
            <h3>Información del negocio</h3>
            <p>Estos datos ayudan al bot a responder de forma consistente.</p>
          </div>
        </div>
        <label class="full-width">
          Descripción del negocio
          <textarea formControlName="businessDescription" rows="3" placeholder="Qué hace tu negocio y a quién atiende"></textarea>
        </label>
        <label class="full-width">
          Horario de atención
          <textarea formControlName="businessHours" rows="2" placeholder="Lunes a viernes, 8:00 a. m. a 6:00 p. m."></textarea>
        </label>
        <label>
          Tono de comunicación
          <select formControlName="tone">
            <option value="formal">Formal</option>
            <option value="cercano">Cercano</option>
            <option value="divertido">Divertido</option>
          </select>
        </label>
        <label class="full-width">
          Qué no debe prometer el bot
          <textarea formControlName="prohibitedPromises" rows="3" placeholder="Ej. No confirmar inventario ni precios finales sin validación"></textarea>
        </label>
        <label class="full-width">
          Reglas especiales de escalamiento
          <textarea formControlName="escalationRules" rows="3" placeholder="Ej. Escalar solicitudes de garantía o reclamos de pago"></textarea>
        </label>
        @if (settingsSuccess()) { <p class="success full-width">{{ settingsSuccess() }}</p> }
        <button class="primary-button full-width" type="submit" [disabled]="settingsSaving()">
          {{ settingsSaving() ? 'Guardando…' : 'Guardar configuración del bot' }}
        </button>
      </form>

      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>Servicios o productos</h3>
            <p>Indica qué ofreces para que el bot pueda orientarlos correctamente.</p>
          </div>
        </div>
        <form class="inline-form" [formGroup]="serviceForm" (ngSubmit)="saveService()">
          <label>
            Nombre
            <input formControlName="name" placeholder="Ej. Reparación de celulares" />
          </label>
          <label>
            Descripción
            <input formControlName="description" placeholder="Información breve" />
          </label>
          <button class="primary-button" type="submit" [disabled]="serviceForm.invalid || itemSaving()">
            {{ editingServiceId() ? 'Actualizar' : 'Agregar' }}
          </button>
          @if (editingServiceId()) {
            <button class="secondary-button" type="button" (click)="cancelServiceEdit()">Cancelar</button>
          }
        </form>
        @if (!services().length) {
          <p class="empty-state">Aún no has agregado servicios o productos.</p>
        } @else {
          <div class="config-list">
            @for (service of services(); track service.id) {
              <article class="config-item" [class.config-item-inactive]="!service.is_active">
                <div><strong>{{ service.name }}</strong><p>{{ service.description || 'Sin descripción' }}</p></div>
                <div class="action-cell">
                  <button class="text-button" type="button" (click)="editService(service)">Editar</button>
                  <button class="text-button" type="button" (click)="toggleService(service)">
                    {{ service.is_active ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button class="text-button danger-text" type="button" (click)="deleteService(service)">Eliminar</button>
                </div>
              </article>
            }
          </div>
        }
      </section>

      <section class="panel">
        <div class="panel-title">
          <div>
            <h3>Preguntas frecuentes</h3>
            <p>Agrega respuestas que el bot pueda reutilizar de forma confiable.</p>
          </div>
        </div>
        <form class="faq-form" [formGroup]="faqForm" (ngSubmit)="saveFaq()">
          <label>
            Pregunta
            <input formControlName="question" placeholder="Ej. ¿Cuál es el horario?" />
          </label>
          <label>
            Respuesta
            <textarea formControlName="answer" rows="3"></textarea>
          </label>
          <div class="button-row">
            <button class="primary-button" type="submit" [disabled]="faqForm.invalid || itemSaving()">
              {{ editingFaqId() ? 'Actualizar pregunta' : 'Agregar pregunta' }}
            </button>
            @if (editingFaqId()) {
              <button class="secondary-button" type="button" (click)="cancelFaqEdit()">Cancelar</button>
            }
          </div>
        </form>
        @if (!faqs().length) {
          <p class="empty-state">Aún no has agregado preguntas frecuentes.</p>
        } @else {
          <div class="config-list">
            @for (faq of faqs(); track faq.id) {
              <article class="config-item" [class.config-item-inactive]="!faq.is_active">
                <div><strong>{{ faq.question }}</strong><p>{{ faq.answer }}</p></div>
                <div class="action-cell">
                  <button class="text-button" type="button" (click)="editFaq(faq)">Editar</button>
                  <button class="text-button" type="button" (click)="toggleFaq(faq)">
                    {{ faq.is_active ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button class="text-button danger-text" type="button" (click)="deleteFaq(faq)">Eliminar</button>
                </div>
              </article>
            }
          </div>
        }
      </section>
    }
  `,
})
export class BotSettingsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly portalService = inject(PortalService);

  readonly configuration = signal<BotConfiguration | null>(null);
  readonly services = computed(() => this.configuration()?.services ?? []);
  readonly faqs = computed(() => this.configuration()?.faqs ?? []);
  readonly error = signal('');
  readonly settingsSuccess = signal('');
  readonly settingsSaving = signal(false);
  readonly itemSaving = signal(false);
  readonly editingServiceId = signal<number | null>(null);
  readonly editingFaqId = signal<number | null>(null);
  readonly settingsForm = this.formBuilder.nonNullable.group({
    businessDescription: [''],
    businessHours: [''],
    tone: ['cercano' as BotTone],
    prohibitedPromises: [''],
    escalationRules: [''],
  });
  readonly serviceForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });
  readonly faqForm = this.formBuilder.nonNullable.group({
    question: ['', Validators.required],
    answer: ['', Validators.required],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.error.set('');
    this.portalService.getBotConfiguration().subscribe({
      next: (configuration) => {
        this.configuration.set(configuration);
        this.settingsForm.setValue({
          businessDescription: configuration.settings.business_description,
          businessHours: configuration.settings.business_hours,
          tone: configuration.settings.tone,
          prohibitedPromises: configuration.settings.prohibited_promises,
          escalationRules: configuration.settings.escalation_rules,
        });
      },
      error: () => this.error.set('No fue posible cargar la configuración del bot.'),
    });
  }

  saveSettings(): void {
    if (this.settingsSaving()) {
      return;
    }
    const value = this.settingsForm.getRawValue();
    this.settingsSaving.set(true);
    this.settingsSuccess.set('');
    this.portalService
      .updateBotSettings({
        business_description: value.businessDescription.trim(),
        business_hours: value.businessHours.trim(),
        tone: value.tone,
        prohibited_promises: value.prohibitedPromises.trim(),
        escalation_rules: value.escalationRules.trim(),
      })
      .pipe(finalize(() => this.settingsSaving.set(false)))
      .subscribe({
        next: (configuration) => {
          this.configuration.set(configuration);
          this.settingsSuccess.set('Configuración guardada. El bot usará estos cambios en el siguiente mensaje.');
        },
        error: (response: HttpErrorResponse) =>
          this.error.set(response.error?.detail ?? 'No fue posible guardar la configuración.'),
      });
  }

  saveService(): void {
    if (this.serviceForm.invalid || this.itemSaving()) {
      return;
    }
    const value = this.serviceForm.getRawValue();
    this.itemSaving.set(true);
    const action = this.editingServiceId()
      ? this.portalService.updateBotService(this.editingServiceId()!, {
          name: value.name.trim(),
          description: value.description.trim(),
        })
      : this.portalService.createBotService({
          name: value.name.trim(),
          description: value.description.trim(),
        });
    action.pipe(finalize(() => this.itemSaving.set(false))).subscribe({
      next: () => {
        this.cancelServiceEdit();
        this.load();
      },
      error: (response: HttpErrorResponse) =>
        this.error.set(response.error?.detail ?? 'No fue posible guardar el servicio.'),
    });
  }

  editService(service: BotServiceItem): void {
    this.editingServiceId.set(service.id);
    this.serviceForm.setValue({ name: service.name, description: service.description });
  }

  cancelServiceEdit(): void {
    this.editingServiceId.set(null);
    this.serviceForm.reset();
  }

  toggleService(service: BotServiceItem): void {
    this.updateService(service.id, { is_active: !service.is_active });
  }

  deleteService(service: BotServiceItem): void {
    if (!confirm(`¿Eliminar "${service.name}"?`)) {
      return;
    }
    this.itemSaving.set(true);
    this.portalService
      .deleteBotService(service.id)
      .pipe(finalize(() => this.itemSaving.set(false)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('No fue posible eliminar el servicio.'),
      });
  }

  saveFaq(): void {
    if (this.faqForm.invalid || this.itemSaving()) {
      return;
    }
    const value = this.faqForm.getRawValue();
    this.itemSaving.set(true);
    const action = this.editingFaqId()
      ? this.portalService.updateBotFaq(this.editingFaqId()!, {
          question: value.question.trim(),
          answer: value.answer.trim(),
        })
      : this.portalService.createBotFaq({
          question: value.question.trim(),
          answer: value.answer.trim(),
        });
    action.pipe(finalize(() => this.itemSaving.set(false))).subscribe({
      next: () => {
        this.cancelFaqEdit();
        this.load();
      },
      error: (response: HttpErrorResponse) =>
        this.error.set(response.error?.detail ?? 'No fue posible guardar la pregunta frecuente.'),
    });
  }

  editFaq(faq: BotFaq): void {
    this.editingFaqId.set(faq.id);
    this.faqForm.setValue({ question: faq.question, answer: faq.answer });
  }

  cancelFaqEdit(): void {
    this.editingFaqId.set(null);
    this.faqForm.reset();
  }

  toggleFaq(faq: BotFaq): void {
    this.itemSaving.set(true);
    this.portalService
      .updateBotFaq(faq.id, { is_active: !faq.is_active })
      .pipe(finalize(() => this.itemSaving.set(false)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('No fue posible actualizar la pregunta frecuente.'),
      });
  }

  deleteFaq(faq: BotFaq): void {
    if (!confirm('¿Eliminar esta pregunta frecuente?')) {
      return;
    }
    this.itemSaving.set(true);
    this.portalService
      .deleteBotFaq(faq.id)
      .pipe(finalize(() => this.itemSaving.set(false)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('No fue posible eliminar la pregunta frecuente.'),
      });
  }

  private updateService(
    serviceId: number,
    changes: Partial<Pick<BotServiceItem, 'name' | 'description' | 'is_active'>>,
  ): void {
    this.itemSaving.set(true);
    this.portalService
      .updateBotService(serviceId, changes)
      .pipe(finalize(() => this.itemSaving.set(false)))
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('No fue posible actualizar el servicio.'),
      });
  }
}
