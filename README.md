# Reservas de gimnasio · Bamboo Leaf Studio

Pequeña aplicación en **Angular 17** que representa la vista de un sistema de reservas de turnos para un gimnasio. Permite ver un listado de clases, abrir el detalle de cada una y reservar un cupo (acción simulada, sin persistencia real).

Desarrollada como prueba técnica frontend.

---

## Stack

- **Angular 17.3** con _standalone components_ y nueva _control flow syntax_ (`@if`, `@for`).
- **TypeScript 5.4** en modo `strict`.
- **Signals** para estado reactivo local de cada componente.
- **RxJS** para la comunicación con `HttpClient`.
- **Reactive Forms** en el formulario de reserva.
- **HTML + SCSS puros** — sin librerías de UI (Material, PrimeNG, Bootstrap, Tailwind).
- **Jasmine + Karma** para los tests unitarios.

## Versiones utilizadas

| Herramienta | Versión |
| ----------- | ------- |
| Node.js     | 24.5.0  |
| npm         | 11.5.2  |
| Angular CLI | 17.3.x  |
| Angular     | 17.3.x  |

> El proyecto fue probado en macOS con Node 24, pero funciona con cualquier versión LTS reciente (≥ 18.13).

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm start
# o equivalente:
npx ng serve
```

La app queda disponible en [http://localhost:4200](http://localhost:4200).

### Otros comandos

```bash
npm run build        # build de producción (dist/gym-reservations)
npm test             # tests unitarios (Karma + Jasmine)
```

Para correr los tests en CI / headless:

```bash
npx ng test --browsers=ChromeHeadless --watch=false
```

---

## Arquitectura de componentes

```
AppComponent (shell + estado de selección)
├── BookingListComponent
│   └── carga las reservas vía HttpClient y muestra el grid de tarjetas
└── BookingDetailComponent
    └── recibe la reserva seleccionada y permite confirmar el cupo
```

| Componente               | Responsabilidad                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `AppComponent`           | Layout principal (header / main / footer). Mantiene la reserva seleccionada y alterna entre listado y detalle.   |
| `BookingListComponent`   | Obtiene las reservas con `BookingService`, gestiona los estados _loading / error / empty_ y emite la selección.  |
| `BookingDetailComponent` | Muestra el detalle de la reserva, valida un Reactive Form de cupos y delega la reserva al `BookingService`.      |

Todos los componentes son **standalone** y usan `ChangeDetectionStrategy.OnPush` con _signals_ como fuente de verdad local.

### Estrategia de comunicación elegida: `@Input()` / `@Output()`

Para la comunicación entre `BookingListComponent` y `BookingDetailComponent` opté por la opción **padre-hijo con `@Input()` / `@Output()`**, mediada por `AppComponent`:

- `BookingListComponent` emite el evento `bookingSelected` con la reserva elegida.
- `AppComponent` guarda esa selección en un `signal<Booking | null>` y, según su valor, renderiza el listado o el detalle.
- `BookingDetailComponent` recibe la reserva por `@Input({ required: true })` y emite un `back` cuando el usuario quiere volver al listado.

**Por qué esta opción y no un servicio compartido con `BehaviorSubject`:** los dos componentes nunca conviven en pantalla y el flujo de datos es estrictamente unidireccional (lista → padre → detalle). Introducir un servicio de estado para un único valor simple agregaría indirección sin ningún beneficio real. El patrón padre-hijo deja el flujo explícito en el template y mantiene a los componentes desacoplados entre sí (ninguno importa al otro).

### Estados visuales del listado

`BookingListComponent` cubre los cuatro estados que pide el enunciado:

- **Loading** — spinner mientras se resuelve la petición HTTP.
- **Error** — mensaje en banner rojo + botón _Reintentar_ que vuelve a disparar la petición.
- **Empty** — mensaje informativo si la respuesta es `[]`.
- **Lista poblada** — grid responsivo de tarjetas (`auto-fill, minmax(280px, 1fr)`).

---

## Simulación de la API

La API se simula con un **HTTP interceptor funcional** ([src/app/interceptors/mock-bookings.interceptor.ts](src/app/interceptors/mock-bookings.interceptor.ts)). Esto permite que el resto de la aplicación use `HttpClient` exactamente como lo haría contra un backend real, mientras el interceptor intercepta las peticiones a `/api/bookings` y devuelve un `HttpResponse` con datos mockeados (con un pequeño `delay` de 600 ms para que el estado de _loading_ sea visible).

```ts
// app.config.ts
provideHttpClient(withInterceptors([mockBookingsInterceptor]));
```

Ventajas de este enfoque frente a un `of([...])` directo en el servicio:

- El servicio (`BookingService`) queda escrito como código de producción real (`http.get<Booking[]>('/api/bookings')`), sin acoplarse al mock.
- Reemplazar el mock por un backend real es solamente quitar el interceptor del `appConfig`.
- Permite probar los _interceptors_ y la cadena de RxJS sin levantar `json-server`.

La acción de reserva en sí (`BookingService.reserve(id)`) está simulada con un `of(...)` con `delay`, ya que el enunciado aclara que la reserva no debe persistirse.

---

## Modelo de datos

```ts
// src/app/models/booking.model.ts
export interface Booking {
  id: number;
  className: string;   // "Yoga", "Crossfit", ...
  instructor: string;
  schedule: string;    // "Lunes 18:00"
  availableSpots: number;
}
```

---

## Estructura de carpetas

```
src/app/
├── app.component.{ts,html,scss}
├── app.config.ts
├── components/
│   ├── booking-list/
│   │   └── booking-list.component.{ts,html,scss}
│   └── booking-detail/
│       └── booking-detail.component.{ts,html,scss}
├── interceptors/
│   └── mock-bookings.interceptor.ts
├── models/
│   └── booking.model.ts
└── services/
    ├── booking.service.ts
    └── booking.service.spec.ts
```

---

## Puntos extra implementados

- **Standalone components** y **control flow syntax** (`@if`, `@for`).
- **Signals** (`signal`, `computed`) para todo el estado local + `OnPush`.
- **Reactive Forms** en el formulario de reserva, con validadores `required / min / max` derivados de la disponibilidad real.
- **Tests unitarios** del servicio (`HttpTestingController`) y del componente raíz.
- **HTTP interceptor** funcional (en lugar de devolver `of(...)` desde el servicio).
- **Animación suave** de aparición del detalle (`fade-in` con `@keyframes`).
- **Responsividad fluida** — el grid usa `auto-fill, minmax(280px, 1fr)` y el layout escala con `clamp()`.
- **Accesibilidad básica** — roles ARIA, `aria-live` en _loading_, `aria-label` en botones, foco visible.

### Puntos no incluidos (y por qué)

- **Lazy loading de rutas** — el enunciado solo pide listado y detalle; al no haber router en el proyecto, agregar un módulo lazy sería forzar arquitectura para sumar puntos.
- **Despliegue en Vercel/Netlify** — fuera del alcance del entorno local de la prueba.

---

## Decisiones técnicas resumidas

- **Por qué `OnPush` + signals:** combinación recomendada en Angular 17 para evitar _change detection_ innecesario y dejar las re-renderizaciones bajo control explícito.
- **Por qué un interceptor en vez de `json-server`:** evita una dependencia adicional y mantiene la prueba ejecutable con un único `npm install`.
- **Por qué `takeUntilDestroyed(destroyRef)`:** alternativa moderna a `Subject<void>` + `takeUntil` en `ngOnDestroy`; menos boilerplate y más legible.
- **Por qué SCSS y custom properties:** los _design tokens_ viven en `:root` (`styles.scss`) y se consumen como `var(--color-primary)` desde cada componente, lo que centraliza la paleta sin necesidad de importar partials desde cada SCSS.
