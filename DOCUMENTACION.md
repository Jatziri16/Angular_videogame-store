# Documentación — Tienda Videojuegos (Angular)

Cliente web de la tienda de videojuegos. Es una aplicación Angular 19 que administra el inventario de títulos. No abre una conexión JDBC ni habla con MySQL: envía peticiones HTTP JSON a la API REST del proyecto Java EE `TiendaVideojuegos`, y esa API es la que persiste los datos con Hibernate.

| Pieza | Valor |
| --- | --- |
| Nombre npm | `tienda-videojuegos-web` |
| Angular | 19.2 |
| UI | PrimeNG 19 + tema Aura + PrimeIcons |
| Arranque en desarrollo | `http://localhost:4200/` |
| API en desarrollo | `http://localhost:8080/TiendaVideojuegos/api` |
| Base de datos | MariaDB / MySQL, esquema `videogame_store` |
| Tablas que usa esta app | `cat_videojuegos`, `cat_plataformas` |

---

## 1. Cómo se conectan las capas

```text
Navegador (Angular, puerto 4200)
        |
        |  HttpClient  JSON
        v
API Jersey  http://localhost:8080/TiendaVideojuegos/api
        |
        |  RestPersistence  (sesión Hibernate)
        v
Hibernate SessionFactory  (hibernate.cfg.xml)
        |
        |  JDBC  com.mysql.cj.jdbc.Driver
        v
MySQL / MariaDB  jdbc:mysql://localhost/videogame_store
        |
        +-- cat_videojuegos
        +-- cat_plataformas
```

Angular solo consume dos recursos: videojuegos (alta, consulta, edición y baja) y plataformas (solo lectura, para mostrar y elegir la plataforma de un título).

El resto de la API Java (`/proveedores`, `/ofertas`, `/proveedores-plataformas`, `/salud`) existe en el servidor, pero esta aplicación todavía no la llama. La barra de navegación deja esas secciones marcadas como pendientes porque siguen viviendo en las pantallas JSP.

---

## 2. Estructura del proyecto

```text
src/
  main.ts                          Arranque standalone
  index.html                       <app-root>, idioma es
  styles.scss                      Tema visual global (réplica de las JSP)
  environments/
    environment.ts                 Producción: apiUrl relativa
    environment.development.ts    Desarrollo: API en localhost:8080
  app/
    app.component.ts|html|scss     Cascarón: navbar, router, toast, confirmación
    app.config.ts                  Router, HttpClient, PrimeNG, servicios globales
    app.routes.ts                  Redirección raíz y carga perezosa de videojuegos
    core/
      http/http-error.util.ts      Traduce errores HTTP a un texto para el usuario
      models/plataforma.model.ts   Contrato JSON de una plataforma
      services/plataformas.service.ts
      layout/app-navbar/           Barra superior
    features/videojuegos/
      models/videojuego.model.ts
      services/videojuegos.service.ts
      videojuegos.routes.ts
      pages/videojuegos-list/      Tabla del inventario
      pages/videojuego-form/       Alta y edición
```

No hay módulos `NgModule`. Cada componente declara sus propios `imports`. Los servicios se registran con `providedIn: 'root'`, así que hay una sola instancia en toda la aplicación.

---

## 3. Arranque y configuración

### 3.1 `main.ts`

`bootstrapApplication(AppComponent, appConfig)` levanta el componente raíz con la configuración de `app.config.ts`.

### 3.2 Proveedores (`app.config.ts`)

| Proveedor | Para qué sirve |
| --- | --- |
| `provideZoneChangeDetection({ eventCoalescing: true })` | Detección de cambios de Angular, agrupando eventos. |
| `provideRouter(routes, withComponentInputBinding())` | Enruta y copia los parámetros de la URL a `input()` del componente. Así `:id` llega al formulario como `id`. |
| `provideHttpClient(withFetch())` | Cliente HTTP sobre la API `fetch` del navegador. |
| `provideAnimationsAsync()` | Animaciones que usa PrimeNG. |
| `providePrimeNG` | Tema Aura, modo oscuro desactivado, ripple activo. |
| `MessageService` | Toasts (`p-toast`). |
| `ConfirmationService` | Diálogo de confirmación antes de borrar (`p-confirmDialog`). |

No hay interceptor HTTP. La URL base se arma en cada servicio con `environment.apiUrl`. No hay `proxy.conf.json`: en desarrollo el navegador llama directo al puerto 8080. El filtro CORS de la API Java responde `Access-Control-Allow-Origin: *` y acepta `GET, POST, PUT, DELETE, OPTIONS`.

### 3.3 Entornos

Desarrollo (`ng serve` usa la configuración `development` y sustituye el archivo):

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/TiendaVideojuegos/api'
};
```

Producción (`ng build`, configuración por defecto):

```ts
export const environment = {
  production: true,
  apiUrl: '/TiendaVideojuegos/api'
};
```

En producción la URL es relativa al mismo host que sirve el WAR de Java. El contexto de la aplicación en Tomcat es `/TiendaVideojuegos` y el servlet Jersey está mapeado a `/api/*` en `web.xml`.

### 3.4 Scripts

| Comando | Efecto |
| --- | --- |
| `npm start` / `ng serve` | Servidor de desarrollo en el puerto 4200, con el entorno de desarrollo. |
| `ng build` | Compilación de producción en `dist/tienda-videojuegos-web`. |
| `npm run watch` | Compilación continua en modo desarrollo. |
| `ng test` | Pruebas unitarias con Karma. El spec de `AppComponent` fue eliminado; no hay pruebas de los servicios ni de las páginas. |

Para que las pantallas muestren datos, Tomcat tiene que tener desplegado `TiendaVideojuegos` y MySQL tiene que tener el esquema `videogame_store`.

---

## 4. Rutas

`app.routes.ts`:

| Ruta | Comportamiento |
| --- | --- |
| `''` | Redirige a `videojuegos`. |
| `videojuegos` | Carga perezosa de `VIDEOJUEGOS_ROUTES`. |
| `**` | Redirige a `videojuegos`. |

`videojuegos.routes.ts` (rutas hijas, también perezosas por componente):

| Ruta completa | Título de la pestaña | Componente |
| --- | --- | --- |
| `/videojuegos` | Videojuegos \| Tienda Videojuegos | `VideojuegosListComponent` |
| `/videojuegos/nuevo` | Nuevo videojuego \| Tienda Videojuegos | `VideojuegoFormComponent` |
| `/videojuegos/:id/editar` | Editar videojuego \| Tienda Videojuegos | `VideojuegoFormComponent` |

El mismo formulario sirve para crear y editar. Si la URL trae `:id`, `esEdicion()` es verdadero y se carga el registro. Si no, el formulario queda vacío y el guardado hace `POST`.

---

## 5. Componentes

### 5.1 `AppComponent`

- Selector: `app-root`
- Archivos: `src/app/app.component.ts`, `.html`, `.scss`
- Clase vacía: no tiene estado ni lógica.

Plantilla, de arriba hacia abajo:

1. `<app-navbar />`
2. `<router-outlet />` — aquí se monta la lista o el formulario.
3. `<p-toast position="top-right" />` — mensajes de éxito y error de toda la app.
4. `<p-confirmDialog styleClass="app-confirm" />` — confirmación de borrado.

El host ocupa al menos el alto de la ventana (`min-height: 100vh`).

### 5.2 `AppNavbarComponent`

- Selector: `app-navbar`
- Archivos: `src/app/core/layout/app-navbar/`
- Estilos: clases globales de `src/styles.scss` (`.app-navbar`, `.nav-link`, …).

Estado:

| Miembro | Tipo | Uso |
| --- | --- | --- |
| `seccionesPendientes` | `string[]` fijo | `Ofertas`, `Proveedores`, `Plataformas`, `Relaciones`. Se pintan como texto, no como enlaces. |
| `menuAbierto` | `signal<boolean>` | Menú colapsable en pantallas de hasta 900 px. |
| `alternarMenu()` | método | Invierte `menuAbierto`. |
| `cerrarMenu()` | método | Lo cierra al pulsar el enlace de Videojuegos. |

El único enlace real es `routerLink="/videojuegos"`, con la clase `is-active` cuando esa ruta está activa. El botón de hamburguesa usa `aria-expanded` y `aria-controls="navbarLinks"`.

### 5.3 `VideojuegosListComponent`

- Selector: `app-videojuegos-list`
- Ruta: `/videojuegos`
- Archivos: `src/app/features/videojuegos/pages/videojuegos-list/`

Dependencias inyectadas: `VideojuegosService`, `PlataformasService`, `ConfirmationService`, `MessageService`.

Estado:

| Signal / computed | Contenido |
| --- | --- |
| `videojuegos` | Arreglo que alimenta la tabla. |
| `plataformas` | Catálogo para resolver el nombre a partir de `plataformaId`. |
| `cargando` | Bandera de la tabla PrimeNG (`[loading]`). |
| `plataformaPorId` | `Map<id, Plataforma>` recalculado cuando cambia el catálogo. |

Qué hace al entrar (`ngOnInit` → `cargar()`):

1. Pone `cargando` en verdadero.
2. Dispara en paralelo, con `forkJoin`:
   - `GET /videojuegos`
   - `GET /plataformas`
3. Si el catálogo de plataformas falla, `catchError` lo sustituye por `[]`. La tabla igual se muestra y la columna Plataforma queda en «Sin plataforma asignada».
4. Si falla el listado de videojuegos, vacía la tabla y muestra un toast de error.
5. `plataformaDe(videojuego)` busca la plataforma en el mapa. Si `plataformaId` es `null`, devuelve `undefined`.

Tabla (`p-table`):

| Columna | Origen |
| --- | --- |
| # | Índice visual de la fila (`rowIndex + 1`), no es el id de base de datos. |
| ID | `videojuego.id` (`cat_vid_id`). |
| Nombre | `videojuego.titulo`. |
| Plataforma | `#id - nombre` y, si existe, la compañía. |
| Inventario | `N disponibles`. La insignia usa la clase `is-empty` cuando el valor es 0. |
| Acciones | Editar navega a `/videojuegos/{id}/editar`. Eliminar abre el diálogo. |

Paginación: 10 filas por página, solo si hay más de 10 registros. Opciones: 10, 25 y 50. Si no hay filas, el mensaje vacío ofrece el botón «Agregar Videojuego».

Borrado:

1. `confirmarEliminacion` abre el diálogo de PrimeNG con el título del juego.
2. Si el usuario acepta, `DELETE /videojuegos/{id}`.
3. Éxito: toast y se vuelve a llamar `cargar()` para refrescar lista y catálogo.
4. Error: toast con el mensaje de la API (`mensajeDeError`).

### 5.4 `VideojuegoFormComponent`

- Selector: `app-videojuego-form`
- Rutas: `/videojuegos/nuevo` y `/videojuegos/:id/editar`
- Archivos: `src/app/features/videojuegos/pages/videojuego-form/`

Dependencias: `VideojuegosService`, `PlataformasService`, `MessageService`, `Router`.

Estado:

| Miembro | Uso |
| --- | --- |
| `id = input<string>()` | Parámetro `:id` de la ruta, gracias a `withComponentInputBinding()`. En alta es `undefined`. |
| `esEdicion` | `id() !== undefined`. Cambia título, botón y si se muestra el campo ID. |
| `plataformas` | Opciones del `p-select`. |
| `cargando` | Verdadero mientras llega el videojuego a editar. Deshabilita el botón de guardar. |
| `guardando` | Verdadero durante POST o PUT. Muestra el spinner del botón. |

Formulario reactivo:

| Control | Valor inicial | Validación en el cliente | Columna MySQL |
| --- | --- | --- | --- |
| `titulo` | `''` | Obligatorio, máximo 25 caracteres. El input también tiene `maxlength="25"`. | `cat_vid_nombre` varchar(25) NOT NULL |
| `plataformaId` | `null` | Opcional. El select permite limpiar la selección. | `cat_vid_pla_id`, admite NULL |
| `inventario` | `0` | Obligatorio y `min(0)`. Input `type="number"` con `min="0"`. | `cat_vid_inventario` smallint unsigned, default 0 |

Al entrar:

1. Siempre pide `GET /plataformas` para llenar el select. Si falla, toast de advertencia y el select queda vacío; el usuario aún puede guardar sin plataforma.
2. Solo en edición: `GET /videojuegos/{id}` y `form.setValue(...)`. Si el id no existe o la API falla, toast de error y regreso a `/videojuegos`.

Al enviar (`guardar()`):

1. Si el formulario es inválido, marca todos los controles como tocados y no llama a la API. Los mensajes visibles son «El título es obligatorio.» y «Indica un inventario igual o mayor que cero.»
2. Arma un `VideojuegoPayload`: título recortado con `trim()`, `plataformaId` (número o `null`) e inventario.
3. Sin id en la ruta: `POST /videojuegos`. Con id: `PUT /videojuegos/{id}`.
4. Éxito: toast («Videojuego insertado» o «Videojuego actualizado») y navegación a `/videojuegos`.
5. Error: toast con el texto de la API y el formulario se queda en pantalla para corregir.

El campo ID de la edición está deshabilitado. No se envía en el cuerpo: el id viaja en la URL y lo asigna la base de datos en el alta (`AUTO_INCREMENT`).

El select muestra en cada opción el nombre y, debajo, la compañía cuando no es nula. `optionValue` es `id`, así el control guarda el número, no el objeto.

---

## 6. Modelos

### `Videojuego` — `src/app/features/videojuegos/models/videojuego.model.ts`

Refleja `VideojuegoDTO` de Java y la tabla `cat_videojuegos`.

```ts
export interface Videojuego {
  id: number;
  titulo: string;
  plataformaId: number | null;
  inventario: number;
}

export type VideojuegoPayload = Omit<Videojuego, 'id'>;
```

Ejemplo de respuesta de `GET /videojuegos/1`:

```json
{
  "id": 1,
  "titulo": "Mario Kart",
  "plataformaId": 3,
  "inventario": 10
}
```

Ejemplo de cuerpo de `POST` y `PUT` (sin `id`):

```json
{
  "titulo": "Mario Kart",
  "plataformaId": 3,
  "inventario": 10
}
```

`plataformaId` puede ir en `null` cuando el título no tiene plataforma.

### `Plataforma` — `src/app/core/models/plataforma.model.ts`

Refleja `PlataformaDTO` y la tabla `cat_plataformas`.

```ts
export interface Plataforma {
  id: number;
  nombre: string;
  compania: string | null;
}
```

```json
{
  "id": 2,
  "nombre": "PlayStation 5",
  "compania": "Sony"
}
```

---

## 7. Servicios y peticiones que hace Angular

Base en desarrollo: `http://localhost:8080/TiendaVideojuegos/api`.
Todas las peticiones usan `Content-Type: application/json` cuando llevan cuerpo. No hay cabeceras de autenticación.

### 7.1 `VideojuegosService`

Archivo: `src/app/features/videojuegos/services/videojuegos.service.ts`.
URL: `` `${environment.apiUrl}/videojuegos` ``.

| Método del servicio | HTTP | URL | Cuerpo | Respuesta esperada | Quién lo llama |
| --- | --- | --- | --- | --- | --- |
| `listar()` | `GET` | `/api/videojuegos` | — | `Videojuego[]` (200) | Lista, al entrar y después de borrar |
| `obtener(id)` | `GET` | `/api/videojuegos/{id}` | — | `Videojuego` (200) | Formulario de edición |
| `crear(payload)` | `POST` | `/api/videojuegos` | `VideojuegoPayload` | `Videojuego` creado (201) | Formulario en alta |
| `actualizar(id, payload)` | `PUT` | `/api/videojuegos/{id}` | `VideojuegoPayload` | `Videojuego` (200) | Formulario en edición |
| `eliminar(id)` | `DELETE` | `/api/videojuegos/{id}` | — | vacío (204) | Lista, tras confirmar |

### 7.2 `PlataformasService`

Archivo: `src/app/core/services/plataformas.service.ts`.
URL: `` `${environment.apiUrl}/plataformas` ``.

| Método del servicio | HTTP | URL | Cuerpo | Respuesta | Quién lo llama |
| --- | --- | --- | --- | --- | --- |
| `listar()` | `GET` | `/api/plataformas` | — | `Plataforma[]` (200) | Lista (en paralelo con los videojuegos) y formulario (opciones del select) |

Angular no crea, edita ni borra plataformas. Esos verbos existen en `PlataformaRecurso` de Java, pero ningún componente de este proyecto los invoca.

### 7.3 Recorrido de cada pantalla

**Abrir `/videojuegos`**

```text
GET /api/videojuegos
GET /api/plataformas
```

**Abrir `/videojuegos/nuevo`**

```text
GET /api/plataformas
```

Al pulsar Insertar, si el formulario es válido:

```text
POST /api/videojuegos
{ "titulo": "...", "plataformaId": 2, "inventario": 10 }
```

**Abrir `/videojuegos/4/editar`**

```text
GET /api/plataformas
GET /api/videojuegos/4
```

Al pulsar Actualizar:

```text
PUT /api/videojuegos/4
{ "titulo": "...", "plataformaId": 2, "inventario": 10 }
```

**Eliminar desde la tabla** (después de aceptar el diálogo):

```text
DELETE /api/videojuegos/4
```

y, si responde 204, otra vez los dos GET del listado.

### 7.4 Qué responde la API cuando algo sale mal

El cuerpo de error, definido en `ApiError.java`, es:

```json
{ "status": 400, "error": "El titulo es obligatorio" }
```

`mensajeDeError` (`src/app/core/http/http-error.util.ts`) hace esto:

1. Si `HttpErrorResponse.status === 0` (servidor apagado, CORS o red): «No se pudo conectar con la API de Java. Verifica que el servidor esté en ejecución.»
2. Si el JSON trae `error` con texto: muestra ese texto.
3. En cualquier otro caso: el mensaje alterno que pasó el componente.

Validaciones del recurso Java de videojuegos (además de las del formulario):

| Condición | HTTP | Mensaje |
| --- | --- | --- |
| Cuerpo ausente | 400 | El cuerpo de la peticion es obligatorio |
| Título vacío o solo espacios | 400 | El titulo es obligatorio |
| Inventario negativo | 400 | El inventario no puede ser negativo |
| GET, PUT o DELETE de un id que no existe | 404 | Videojuego no encontrado |
| Excepción no controlada (por ejemplo, fallo de Hibernate o de MySQL) | 500 | Mensaje de la excepción, o «Error interno del servidor» |

En el alta, Java ignora cualquier `id` que venga en el JSON (`dto.setId(null)`) y deja que MySQL genere `cat_vid_id`. En la edición, el id del cuerpo se sustituye por el de la URL.

Un inventario omitido en el JSON se guarda como `0` (`inventario == null ? 0 : inventario`).

---

## 8. Conexión a la base de datos

Angular no tiene driver, cadena JDBC, usuario ni contraseña. La conexión vive en el backend `JavaEE/TiendaVideojuegos`.

### 8.1 Cadena real que usa la API REST

`HibernateHelper` construye un `SessionFactory` con `new Configuration().configure()`, que lee `src/main/java/hibernate.cfg.xml`:

| Propiedad | Valor |
| --- | --- |
| Driver | `com.mysql.cj.jdbc.Driver` |
| URL | `jdbc:mysql://localhost/videogame_store` |
| Usuario | `root` |
| Contraseña | vacía |
| Pool | 5 conexiones |
| Dialecto | `org.hibernate.dialect.MySQLDialect` |
| SQL en consola | `show_sql = true` |

Entidades mapeadas en ese archivo: `Videojuego`, `Proveedor`, `Plataforma`, `ProveedorPlataforma`, `OfertaVideojuego`.

Cada método de `RestPersistence` abre una sesión, hace el trabajo y la cierra:

| Operación REST | Hibernate |
| --- | --- |
| Listar | `session.createQuery("from Videojuego")` o `"from Plataforma"` |
| Buscar por id | `session.get(Clase, id)` |
| Crear | transacción + `session.persist` |
| Actualizar | transacción + `session.merge` |
| Borrar | transacción + `session.get` y, si existe, `session.remove` |

Si `persist`, `merge` o `remove` lanzan una excepción, la transacción hace rollback y `RestExceptionMapper` responde 500.

Hay un segundo archivo, `META-INF/persistence.xml`, unidad `JavaEE2022`, con la misma URL, el mismo usuario y contraseña vacía, driver `com.mysql.cj.jdbc.Driver` y dialecto `MySQL5Dialect`. Las pantallas JSP antiguas y el código comentado dentro de los beans apuntan a esa unidad JPA. **La API que consume Angular no usa `persistence.xml`:** pasa siempre por `HibernateHelper` y `hibernate.cfg.xml`.

El volcado del esquema está en `JavaEE11_2025/videogame_store.sql`. El servidor de ese dump es MariaDB 10.4 (`127.0.0.1`). Hibernate habla con él mediante el conector MySQL.

### 8.2 Tablas que lee y escribe esta aplicación

#### `cat_videojuegos`

| Columna | Tipo | Nulo | Entidad Java | JSON de Angular |
| --- | --- | --- | --- | --- |
| `cat_vid_id` | `smallint(5) UNSIGNED`, PK, `AUTO_INCREMENT` | no | `cve_vid` | `id` |
| `cat_vid_nombre` | `varchar(25)` | no | `tit_vid` | `titulo` |
| `cat_vid_pla_id` | `tinyint(3) UNSIGNED`, índice, FK | sí | `cat_vid_pla_id` | `plataformaId` |
| `cat_vid_inventario` | `smallint(5) UNSIGNED`, default 0 | sí en la tabla; la entidad lo trata como `int` | `inv_vid` | `inventario` |

Clave foránea `cat_videojuegos_ibfk_1`: `cat_vid_pla_id` → `cat_plataformas.cat_pla_id`.

En el bean, `pre_vid` (precio) y `proveedor` están marcados `@Transient`: no se guardan en esta tabla y no viajan en el JSON de la API.

#### `cat_plataformas`

| Columna | Tipo | Nulo | Entidad Java | JSON de Angular |
| --- | --- | --- | --- | --- |
| `cat_pla_id` | `tinyint(3) UNSIGNED`, PK, `AUTO_INCREMENT` | no | `cve_pla` | `id` |
| `cat_pla_nombre` | `varchar(30)` | no | `nom_pla` | `nombre` |
| `cat_pla_compania` | `varchar(40)` | sí | `compania_pla` | `compania` |

Angular solo hace `SELECT` de esta tabla (el HQL `from Plataforma`). No inserta ni actualiza filas.

### 8.3 Tablas del mismo esquema que esta app no toca

El script también crea catálogos y tablas históricas que las JSP y otros recursos REST sí conocen, pero que ningún servicio de Angular consulta:

| Tabla | Papel en el esquema | Recurso REST (no usado aquí) |
| --- | --- | --- |
| `cat_proveedores` | Proveedores | `/api/proveedores` |
| `proveedores_plataformas` | Relación proveedor–plataforma | `/api/proveedores-plataformas` |
| `videojuegos` | Compras/ventas ligadas a `cat_videojuegos` y `cat_proveedores` | `/api/ofertas` (entidad `OfertaVideojuego`) |
| `old_videojuegos`, `backup_videojuegos`, `backup_proveedores`, `backup_plataforma`, `plataforma`, `proveedores` | Esquema anterior o respaldos | Ninguno de la API actual |

Borrar un videojuego del catálogo puede fallar con 500 si la tabla `videojuegos` todavía tiene filas cuya FK `vj_cat_vid_id` apunta a ese `cat_vid_id`. Borrar una plataforma que algún título todavía referencia también choca con `cat_videojuegos_ibfk_1`; esta pantalla no ofrece ese borrado.

### 8.4 Mapa de un alta, de la pantalla hasta la fila

1. El usuario llena título, plataforma e inventario y pulsa Insertar.
2. El formulario valida longitud y que el inventario no sea negativo.
3. `VideojuegosService.crear` hace `POST http://localhost:8080/TiendaVideojuegos/api/videojuegos`.
4. Jersey enruta a `VideojuegoRecurso.crear`.
5. El DTO se convierte en la entidad `Videojuego` (`titulo` → `cat_vid_nombre`, `plataformaId` → `cat_vid_pla_id`, `inventario` → `cat_vid_inventario`).
6. `RestPersistence.insertar` abre sesión con el `SessionFactory` de `hibernate.cfg.xml` y hace `persist` dentro de una transacción.
7. MySQL inserta en `cat_videojuegos` y devuelve el `cat_vid_id` generado.
8. La API responde 201 con el DTO, incluido el id nuevo.
9. Angular muestra el toast y vuelve a `/videojuegos`, que repite los GET de lista y plataformas.

---

## 9. API Java disponible y todavía no enlazada en la interfaz

Misma base `/TiendaVideojuegos/api`. Cada recurso, salvo salud, expone listar, buscar, crear, actualizar y borrar.

| Ruta | Tabla principal | Uso en Angular |
| --- | --- | --- |
| `GET/POST /videojuegos`, `GET/PUT/DELETE /videojuegos/{id}` | `cat_videojuegos` | Usada por completo |
| `GET /plataformas` | `cat_plataformas` | Solo el GET de listado |
| `POST/PUT/DELETE /plataformas` y `GET /plataformas/{id}` | `cat_plataformas` | No llamada |
| `/proveedores` | `cat_proveedores` | No llamada. En el navbar: «Proveedores» |
| `/ofertas` | tabla de ofertas / `videojuegos` | No llamada. En el navbar: «Ofertas» |
| `/proveedores-plataformas` | `proveedores_plataformas` | No llamada. En el navbar: «Relaciones» |
| `GET /salud` | ninguna | No llamada. Responde `{ "status": "ok", "aplicacion": "TiendaVideojuegos", "api": "/api" }` |

---

## 10. Interfaz y estilos

`src/styles.scss` concentra el tema: navbar oscura fija, paneles blancos, acento `#17b889`, tabla, formulario, botones PrimeNG y el corte responsive en 900 px. Los componentes de página no tienen hoja SCSS propia; usan esas clases globales (`page-shell`, `games-panel`, `form-panel`, `app-btn-primary`, etc.).

Textos de la interfaz en español. `index.html` declara `<html lang="es">` y el título «Tienda Videojuegos».

---

## 11. Puesta en marcha

1. Importar `videogame_store.sql` en MySQL o MariaDB local, base `videogame_store`.
2. Confirmar que `hibernate.cfg.xml` apunta a `jdbc:mysql://localhost/videogame_store` con el usuario que corresponda (en el repo: `root` sin contraseña).
3. Desplegar `JavaEE/TiendaVideojuegos` en Tomcat, contexto `/TiendaVideojuegos`, puerto 8080.
4. Comprobar la API: `GET http://localhost:8080/TiendaVideojuegos/api/salud` debe devolver `status: ok`.
5. En esta carpeta: `npm install` y `npm start`.
6. Abrir `http://localhost:4200/`. La raíz redirige a `/videojuegos` y la tabla debe listar los títulos de `cat_videojuegos`.
