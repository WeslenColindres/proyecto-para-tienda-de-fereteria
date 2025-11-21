import type {
  FavoriteReport,
  ReportId,
  ReportMenuCategory,
  ReportRow,
  ReportView,
  ScheduledReport,
  SendHistory
} from '../types/reports';

export const REPORT_MENU: ReportMenuCategory[] = [
  {
    id: 'ventas',
    label: 'Ventas',
    icon: 'chart',
    items: [
      { id: 'ventas-fecha', label: 'Ventas por fecha', icon: 'calendar' },
      { id: 'ventas-producto', label: 'Ventas por producto', icon: 'box' },
      { id: 'ventas-cliente', label: 'Ventas por cliente', icon: 'user' }
    ]
  },
  {
    id: 'inventario',
    label: 'Productos e inventario',
    icon: 'inventory',
    badge: '12 alertas',
    items: [
      { id: 'inventario-estado', label: 'Estado de inventario', icon: 'shelf', badge: '12 alertas' },
      { id: 'inventario-movimientos', label: 'Movimientos de stock', icon: 'refresh' },
      { id: 'inventario-rotacion', label: 'Rotacion lenta', icon: 'timer' }
    ]
  },
  {
    id: 'financieros',
    label: 'Financieros',
    icon: 'finance',
    items: [
      { id: 'finan-ganancias', label: 'Ganancias y perdidas', icon: 'trend' },
      { id: 'finan-cobrar', label: 'Cuentas por cobrar', icon: 'receivable' },
      { id: 'finan-pagar', label: 'Cuentas por pagar', icon: 'payable' }
    ]
  },
  {
    id: 'exportacion',
    label: 'Exportacion y envio',
    icon: 'rocket',
    items: [
      { id: 'export-excel', label: 'Exportar a Excel', icon: 'excel' },
      { id: 'export-pdf', label: 'Exportar a PDF', icon: 'pdf' },
      { id: 'export-email', label: 'Enviar por Email', icon: 'email' },
      { id: 'export-whatsapp', label: 'Enviar por WhatsApp', icon: 'whatsapp' }
    ]
  }
];

const ventasBaseRows: ReportRow[] = [
  { fecha: '22/11/24', ventas: 23, productos: 45, ticket: '98.50', impuesto: '256.80', total: '2,563.50' },
  { fecha: '21/11/24', ventas: 18, productos: 38, ticket: '87.20', impuesto: '196.40', total: '1,965.40' },
  { fecha: '20/11/24', ventas: 20, productos: 40, ticket: '92.10', impuesto: '210.10', total: '2,105.00' }
];

const ventasProductoRows: ReportRow[] = [
  { rank: '1', producto: 'Cafe Espresso', unidades: 234, monto: '5,850', porcentaje: '4.67%', rotacion: 'Alta' },
  { rank: '2', producto: 'Pan Frances', unidades: 189, monto: '1,512', porcentaje: '3.77%', rotacion: 'Media' },
  { rank: '3', producto: 'Leche entera', unidades: 154, monto: '2,045', porcentaje: '3.22%', rotacion: 'Media' }
];

const inventarioRows: ReportRow[] = [
  { producto: 'Cafe Espresso', stock: 15, minimo: 10, estado: 'Normal', costo: '10.00', valor: '150.00' },
  { producto: 'Pan Frances', stock: 8, minimo: 10, estado: 'Bajo', costo: '5.00', valor: '40.00' },
  { producto: 'Leche', stock: 2, minimo: 10, estado: 'Critico', costo: '8.00', valor: '16.00' }
];

const baseView = (partial: Partial<ReportView>, id: ReportId): ReportView => ({
  id,
  title: 'Reporte',
  subtitle: 'Vista de referencia',
  kpis: [],
  chart: { title: 'Grafico', type: 'bar', description: 'Visualizar datos', hint: 'Hover y zoom habilitado' },
  filters: [],
  table: { columns: [], rows: [] },
  actions: ['Exportar', 'Filtrar', 'Enviar'],
  ...partial
});

export const REPORT_VIEWS: Record<ReportId, ReportView> = {
  'ventas-fecha': baseView(
    {
      title: 'Informe de ventas por fecha',
      subtitle: 'Analiza ingresos diarios, semanales o mensuales',
      tag: 'Temporal',
      kpis: [
        { id: 'ingresos', label: 'Ingresos', value: 'Q125,450', helper: 'Total periodo', trend: '+12.5% vs mes anterior', tone: 'success', icon: 'money' },
        { id: 'ventas', label: 'Total ventas', value: '1,245 ventas', helper: 'Tickets emitidos', trend: '+4.2%', icon: 'receipt' },
        { id: 'ticket', label: 'Ticket promedio', value: 'Q100.76', helper: 'Promedio por ticket', trend: '+3.1%', icon: 'ticket' },
        { id: 'crecimiento', label: 'Crecimiento', value: '+12.5%', helper: 'Vs mes anterior', tone: 'success', icon: 'trend-up' }
      ],
      chart: {
        title: 'Tendencia de ventas',
        type: 'line',
        description: 'Lineas y barras comparando periodo y periodo anterior',
        hint: 'Zoom con scroll, clic para drill-down diario'
      },
      filters: ['Rango de fechas', 'Cliente', 'Tipo documento', 'Estado', 'Comparar periodo'],
      table: {
        columns: [
          { id: 'fecha', label: 'Fecha' },
          { id: 'ventas', label: 'Ventas' },
          { id: 'productos', label: 'Productos' },
          { id: 'ticket', label: 'Ticket' },
          { id: 'impuesto', label: 'Impuesto' },
          { id: 'total', label: 'Total', align: 'right' }
        ],
        rows: ventasBaseRows,
        totals: { operaciones: '77', total: 'Q8,516.00' }
      },
      actions: ['Excel', 'PDF', 'Email', 'WhatsApp'],
      exportHint: 'Incluye KPIs, grafico y tabla completa'
    },
    'ventas-fecha'
  ),
  'ventas-producto': baseView(
    {
      title: 'Informe de ventas por producto',
      subtitle: 'Top productos, rotacion y share de ventas',
      tag: 'Top 10',
      kpis: [
        { id: 'unidades', label: 'Unidades', value: '1,247', helper: 'Vendidas', trend: '+8.1%', icon: 'box' },
        { id: 'monto', label: 'Monto total', value: 'Q125,450', helper: 'Ingresos', trend: '+6.4%', icon: 'money' },
        { id: 'rotacion', label: 'Rotacion', value: '4.2 dias', helper: 'Promedio', tone: 'info', icon: 'timer' }
      ],
      chart: { title: 'Top 10 productos', type: 'bar', description: 'Barras horizontales por unidades y monto', hint: 'Tap para full-screen y drill-down' },
      filters: ['Rango de fechas', 'Categoria', 'Top N', 'Rotacion'],
      table: {
        columns: [
          { id: 'rank', label: '#', width: '50px' },
          { id: 'producto', label: 'Producto' },
          { id: 'unidades', label: 'Unidades' },
          { id: 'monto', label: 'Monto', align: 'right' },
          { id: 'porcentaje', label: '% Total' },
          { id: 'rotacion', label: 'Rotacion' }
        ],
        rows: ventasProductoRows,
        totals: { operaciones: '10', total: 'Q12,567.00' }
      },
      actions: ['Excel', 'PDF', 'Email', 'WhatsApp']
    },
    'ventas-producto'
  ),
  'ventas-cliente': baseView(
    {
      title: 'Informe de ventas por cliente',
      subtitle: 'Top clientes, frecuencia y ticket promedio',
      kpis: [
        { id: 'clientes', label: 'Clientes activos', value: '340', helper: 'Ultimos 30 dias', icon: 'users' },
        { id: 'ticket', label: 'Ticket promedio', value: 'Q142.50', helper: 'Clientes repetitivos', icon: 'ticket' },
        { id: 'frecuencia', label: 'Frecuencia', value: '2.3 visitas', helper: 'Promedio mensual', icon: 'refresh' }
      ],
      chart: { title: 'Clientes por recurrencia', type: 'area', description: 'Curva de visitas y gasto promedio', hint: 'Hover para exactos y comparacion' },
      filters: ['Cliente', 'Segmento', 'Ciudad', 'Metodo de pago'],
      table: {
        columns: [
          { id: 'cliente', label: 'Cliente' },
          { id: 'ventas', label: 'Ventas' },
          { id: 'ticket', label: 'Ticket', align: 'right' },
          { id: 'frecuencia', label: 'Frecuencia' },
          { id: 'ultima', label: 'Ultima compra' }
        ],
        rows: [
          { cliente: 'Juan Perez', ventas: 'Q4,560', ticket: 'Q150', frecuencia: '3/mes', ultima: '21/11/24' },
          { cliente: 'Panaderia Flores', ventas: 'Q3,210', ticket: 'Q180', frecuencia: '2/mes', ultima: '20/11/24' },
          { cliente: 'Super Maya', ventas: 'Q2,980', ticket: 'Q132', frecuencia: '4/mes', ultima: '19/11/24' }
        ]
      },
      actions: ['Exportar', 'Segmentar', 'Campana']
    },
    'ventas-cliente'
  ),
  'inventario-estado': baseView(
    {
      title: 'Estado del inventario',
      subtitle: 'Visibilidad de stock, valor y alertas',
      kpis: [
        { id: 'valor', label: 'Valor inventario', value: 'Q45,230', helper: 'Costo total', icon: 'shelf' },
        { id: 'productos', label: 'Productos con stock', value: '234', helper: 'SKU disponibles', icon: 'box' },
        { id: 'bajo', label: 'Productos bajo stock', value: '12 alertas', helper: 'Reponer pronto', tone: 'warning', icon: 'alert' },
        { id: 'rotacion', label: 'Rotacion promedio', value: '4.2 dias', helper: 'Salidas/ingreso', icon: 'refresh' }
      ],
      chart: {
        title: 'Stock por categoria',
        type: 'bar',
        description: 'Barras por categoria con stock disponible',
        hint: 'Overlay con tendencia de rotacion'
      },
      filters: ['Almacen', 'Categoria', 'Stock', 'Rotacion'],
      table: {
        columns: [
          { id: 'producto', label: 'Producto' },
          { id: 'stock', label: 'Stock' },
          { id: 'minimo', label: 'Minimo' },
          { id: 'estado', label: 'Estado' },
          { id: 'costo', label: 'Costo', align: 'right' },
          { id: 'valor', label: 'Valor', align: 'right' }
        ],
        rows: inventarioRows,
        totals: { operaciones: '3', total: 'Q206.00' }
      },
      actions: ['Reposicion', 'Exportar', 'Alertas']
    },
    'inventario-estado'
  ),
  'inventario-rotacion': baseView(
    {
      title: 'Productos con rotacion lenta',
      subtitle: 'SKU con ventas bajas y riesgo de expirar',
      kpis: [
        { id: 'lentitud', label: 'Promedio rotacion', value: '32 dias', helper: 'Ultimos 90 dias', tone: 'warning', icon: 'timer' },
        { id: 'riesgo', label: 'En riesgo', value: '14 SKU', helper: 'Baja salida', icon: 'alert' },
        { id: 'valor', label: 'Valor inmovilizado', value: 'Q12,430', helper: 'Costo estatico', icon: 'money' }
      ],
      chart: { title: 'Rotacion por categoria', type: 'bar', description: 'Barras verticales con dias en inventario', hint: 'Click para ver detalle del producto' },
      filters: ['Categoria', 'Dias en stock', 'Almacen'],
      table: {
        columns: [
          { id: 'producto', label: 'Producto' },
          { id: 'dias', label: 'Dias en stock' },
          { id: 'stock', label: 'Stock' },
          { id: 'ventas', label: 'Ventas 30d' },
          { id: 'estado', label: 'Estado' }
        ],
        rows: [
          { producto: 'Mermelada fresa', dias: 65, stock: 40, ventas: 6, estado: 'Lenta' },
          { producto: 'Salsa BBQ', dias: 54, stock: 32, ventas: 5, estado: 'Lenta' },
          { producto: 'Tonica lata', dias: 48, stock: 28, ventas: 9, estado: 'Vigilar' }
        ]
      },
      actions: ['Descuento', 'Traspasar', 'Exportar']
    },
    'inventario-rotacion'
  ),
  'inventario-movimientos': baseView(
    {
      title: 'Movimientos de stock',
      subtitle: 'Entradas, salidas y ajustes',
      kpis: [
        { id: 'entradas', label: 'Entradas', value: '142', helper: 'Ultimos 30 dias', icon: 'arrow-up' },
        { id: 'salidas', label: 'Salidas', value: '133', helper: 'Ventas y ajustes', icon: 'arrow-down' },
        { id: 'ajustes', label: 'Ajustes', value: '12', helper: 'Auditoria', tone: 'warning', icon: 'wrench' }
      ],
      chart: { title: 'Flujo de stock', type: 'area', description: 'Lineas acumuladas por tipo de movimiento', hint: 'Drag & drop para importar filtros' },
      filters: ['Almacen', 'Tipo', 'Usuario', 'Producto'],
      table: {
        columns: [
          { id: 'fecha', label: 'Fecha' },
          { id: 'producto', label: 'Producto' },
          { id: 'tipo', label: 'Tipo' },
          { id: 'cantidad', label: 'Cantidad' },
          { id: 'documento', label: 'Documento' },
          { id: 'usuario', label: 'Usuario' }
        ],
        rows: [
          { fecha: '22/11/24', producto: 'Cafe Espresso', tipo: 'Salida', cantidad: '-12', documento: 'FAC-1054', usuario: 'Ana' },
          { fecha: '22/11/24', producto: 'Pan Frances', tipo: 'Entrada', cantidad: '+50', documento: 'OC-442', usuario: 'Compras' },
          { fecha: '21/11/24', producto: 'Leche', tipo: 'Ajuste', cantidad: '-3', documento: 'AJ-22', usuario: 'Inventarios' }
        ]
      },
      actions: ['Exportar', 'Auditar', 'Notificar']
    },
    'inventario-movimientos'
  ),
  'finan-ganancias': baseView(
    {
      title: 'Ganancias y perdidas',
      subtitle: 'Estado de resultados resumido',
      kpis: [
        { id: 'ingresos', label: 'Ingresos', value: 'Q180,420', helper: 'Mes actual', icon: 'money' },
        { id: 'costos', label: 'Costos', value: 'Q124,180', helper: 'Operativos + COGS', tone: 'warning', icon: 'warning' },
        { id: 'utilidad', label: 'Utilidad neta', value: 'Q56,240', helper: '31.18% margen', trend: '+2.5%', icon: 'trend-up' }
      ],
      chart: { title: 'Ingreso vs gasto', type: 'area', description: 'Validacion mensual de ingresos y costos', hint: 'Comparar con periodo anterior' },
      filters: ['Periodo', 'Centro de costo', 'Moneda'],
      table: {
        columns: [
          { id: 'concepto', label: 'Concepto' },
          { id: 'monto', label: 'Monto', align: 'right' },
          { id: 'variacion', label: 'Variacion' },
          { id: 'comentario', label: 'Comentario' }
        ],
        rows: [
          { concepto: 'Ingresos', monto: 'Q180,420', variacion: '+8%', comentario: 'Ventas retail + eCommerce' },
          { concepto: 'Costo de ventas', monto: 'Q96,140', variacion: '+4%', comentario: 'Mejor margen' },
          { concepto: 'Gastos operativos', monto: 'Q28,040', variacion: '-3%', comentario: 'Ahorro logistica' },
          { concepto: 'Utilidad neta', monto: 'Q56,240', variacion: '+2.5%', comentario: '31.18% margen' }
        ]
      },
      actions: ['Exportar', 'Enviar', 'Programar']
    },
    'finan-ganancias'
  ),
  'finan-cobrar': baseView(
    {
      title: 'Cuentas por cobrar',
      subtitle: 'Vencimientos y riesgo de cartera',
      kpis: [
        { id: 'pendiente', label: 'Pendiente', value: 'Q42,300', helper: 'Total en cartera', icon: 'clock' },
        { id: 'vencido', label: 'Vencido', value: 'Q8,120', helper: '+30 dias', tone: 'warning', icon: 'alert' },
        { id: 'clientes', label: 'Clientes con saldo', value: '58', helper: 'Seguimiento activo', icon: 'users' }
      ],
      chart: { title: 'Vencimientos', type: 'bar', description: 'Tramos 0-30-60-90', hint: 'Hover para valores exactos' },
      filters: ['Cliente', 'Vendedor', 'Vencimiento'],
      table: {
        columns: [
          { id: 'cliente', label: 'Cliente' },
          { id: 'documento', label: 'Documento' },
          { id: 'vencimiento', label: 'Vence' },
          { id: 'saldo', label: 'Saldo', align: 'right' },
          { id: 'estado', label: 'Estado' }
        ],
        rows: [
          { cliente: 'Distribuidora Real', documento: 'FAC-2301', vencimiento: '05/12/24', saldo: 'Q3,450', estado: 'Al dia' },
          { cliente: 'Mini Market 7', documento: 'FAC-2298', vencimiento: '28/11/24', saldo: 'Q1,980', estado: '7 dias' },
          { cliente: 'Panaderia Flores', documento: 'FAC-2291', vencimiento: '18/11/24', saldo: 'Q820', estado: 'Vencido' }
        ]
      },
      actions: ['Recordatorio', 'Exportar', 'Enviar']
    },
    'finan-cobrar'
  ),
  'finan-pagar': baseView(
    {
      title: 'Cuentas por pagar',
      subtitle: 'Compromisos y pagos programados',
      kpis: [
        { id: 'pendiente', label: 'Pendiente', value: 'Q34,900', helper: 'A proveedores', icon: 'payable' },
        { id: 'esta_semana', label: 'Esta semana', value: 'Q8,200', helper: 'Pagos proximos', icon: 'calendar' },
        { id: 'proveedores', label: 'Proveedores', value: '24 con saldo', helper: 'Activos', icon: 'store' }
      ],
      chart: { title: 'Calendario de pagos', type: 'line', description: 'Curva de obligaciones por dia', hint: 'Programar recordatorio' },
      filters: ['Proveedor', 'Vencimiento', 'Banco'],
      table: {
        columns: [
          { id: 'proveedor', label: 'Proveedor' },
          { id: 'documento', label: 'Documento' },
          { id: 'vence', label: 'Vence' },
          { id: 'saldo', label: 'Saldo', align: 'right' },
          { id: 'estado', label: 'Estado' }
        ],
        rows: [
          { proveedor: 'Lacteos SA', documento: 'OC-1044', vence: '25/11/24', saldo: 'Q2,400', estado: 'Pendiente' },
          { proveedor: 'Bodegas Norte', documento: 'OC-1040', vence: '30/11/24', saldo: 'Q5,800', estado: 'Programado' },
          { proveedor: 'Distribuidora Real', documento: 'OC-1032', vence: '04/12/24', saldo: 'Q3,120', estado: 'Pendiente' }
        ]
      },
      actions: ['Programar pago', 'Exportar', 'Enviar']
    },
    'finan-pagar'
  ),
  'export-pdf': baseView(
    {
      title: 'Exportar a PDF',
      subtitle: 'Plantilla con KPIs, graficos y tablas optimizadas',
      kpis: [
        { id: 'formato', label: 'Formato', value: 'PDF', helper: 'A4 / Carta', icon: 'pdf' },
        { id: 'tiempo', label: 'Tiempo', value: '2s', helper: 'Simulado', icon: 'clock' },
        { id: 'imagenes', label: 'Graficos', value: 'Como imagen', helper: 'Incluye totales', icon: 'image' }
      ],
      chart: { title: 'Exportaciones PDF', type: 'bar', description: 'Historico de envios PDF', hint: 'Descarga o compartir' },
      filters: ['Orientacion', 'Rango', 'Incluir graficos'],
      table: {
        columns: [
          { id: 'reporte', label: 'Reporte' },
          { id: 'paginas', label: 'Paginas' },
          { id: 'peso', label: 'Peso', align: 'right' },
          { id: 'opciones', label: 'Opciones' }
        ],
        rows: [
          { reporte: 'Ventas por fecha', paginas: '5', peso: '1.2 MB', opciones: 'KPIs + grafico' },
          { reporte: 'Estado inventario', paginas: '3', peso: '0.8 MB', opciones: 'Tabla completa' }
        ]
      },
      actions: ['Descargar', 'Programar', 'Compartir']
    },
    'export-pdf'
  ),
  'export-excel': baseView(
    {
      title: 'Exportar a Excel',
      subtitle: 'Descarga hojas .xlsx con KPIs, graficos e informacion',
      kpis: [
        { id: 'format', label: 'Formato', value: 'Excel .xlsx', helper: 'Incluye hojas por seccion', icon: 'excel' },
        { id: 'filas', label: 'Filas max', value: '10,000', helper: 'Segun rol', icon: 'ruler' },
        { id: 'tiempo', label: 'Tiempo promedio', value: '2s', helper: 'Simulado', icon: 'clock' }
      ],
      chart: { title: 'Estado de exportaciones', type: 'bar', description: 'Historico de descargas', hint: 'Toast en exitoso' },
      filters: ['Rango de fechas', 'Reportes favoritos', 'Incluir totales'],
      table: {
        columns: [
          { id: 'reporte', label: 'Reporte' },
          { id: 'filas', label: 'Filas' },
          { id: 'incluye', label: 'Incluye' },
          { id: 'nombre', label: 'Nombre archivo' }
        ],
        rows: [
          { reporte: 'Ventas por fecha', filas: '125', incluye: 'KPIs + grafico + tabla', nombre: 'Reporte_Ventas_22-11-2024.xlsx' },
          { reporte: 'Estado inventario', filas: '234', incluye: 'Totales + alertas', nombre: 'Estado_Inventario.xlsx' }
        ]
      },
      actions: ['Descargar', 'Compartir', 'Guardar']
    },
    'export-excel'
  ),
  'export-email': baseView(
    {
      title: 'Enviar por email',
      subtitle: 'Preparar correo con adjuntos y destinatarios',
      kpis: [
        { id: 'plantillas', label: 'Plantillas', value: '3', helper: 'Listas para usar', icon: 'template' },
        { id: 'destinatarios', label: 'Destinatarios', value: '5', helper: 'Seleccionados', icon: 'users' },
        { id: 'adjunto', label: 'Adjunto', value: 'Reporte_Ventas.xlsx', helper: '125 KB', icon: 'attach' }
      ],
      chart: { title: 'Envios recientes', type: 'line', description: 'Historial de emails enviados', hint: 'Spinner al enviar' },
      filters: ['Destinatarios', 'Asunto', 'Mensaje'],
      table: {
        columns: [
          { id: 'para', label: 'Para' },
          { id: 'asunto', label: 'Asunto' },
          { id: 'estado', label: 'Estado' }
        ],
        rows: [
          { para: 'cliente@ejemplo.com', asunto: 'Reporte de Ventas - Nov', estado: 'Enviado' },
          { para: 'admin@corp.com', asunto: 'Estado inventario', estado: 'Programado' }
        ]
      },
      actions: ['Enviar', 'Programar', 'Guardar plantilla']
    },
    'export-email'
  ),
  'export-whatsapp': baseView(
    {
      title: 'Enviar por WhatsApp',
      subtitle: 'Compartir reporte con mensaje personalizado',
      kpis: [
        { id: 'destino', label: 'Contactos', value: '8', helper: 'En agenda', icon: 'whatsapp' },
        { id: 'adjunto', label: 'Adjunto', value: 'Reporte_Ventas.xlsx', helper: 'Opcional', icon: 'attach' },
        { id: 'plantillas', label: 'Plantillas', value: '2', helper: 'Listas', icon: 'template' }
      ],
      chart: { title: 'Envios por canal', type: 'bar', description: 'WhatsApp vs Email vs PDF', hint: 'Si no hay API, compartir archivo y texto' },
      filters: ['Contacto', 'Plantilla', 'Adjunto'],
      table: {
        columns: [
          { id: 'telefono', label: 'Telefono' },
          { id: 'mensaje', label: 'Mensaje' },
          { id: 'estado', label: 'Estado' }
        ],
        rows: [
          { telefono: '+502 5555-1234', mensaje: 'Reporte de ventas de noviembre', estado: 'Enviado' },
          { telefono: '+502 4444-8888', mensaje: 'Stock bajo - alerta', estado: 'Pendiente' }
        ]
      },
      actions: ['Enviar', 'Duplicar enlace', 'Guardar']
    },
    'export-whatsapp'
  )
};

export const FAVORITE_REPORTS: FavoriteReport[] = [
  { id: 'ventas-fecha', label: 'Ventas hoy', kpi: 'Q12,540', action: 'share' },
  { id: 'ventas-producto', label: 'Top productos', kpi: '#10', action: 'share' },
  { id: 'inventario-rotacion', label: 'Stock bajo', kpi: '12 alertas', action: 'share' },
  { id: 'finan-ganancias', label: 'Ganancias', kpi: 'Q56,240', action: 'share' }
];

export const SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 'dailySalesReport', label: 'DIARIO | Ventas del dia', frequency: 'diario', time: '08:00', active: true, format: ['excel', 'pdf'], recipients: ['admin@corp.com', 'gerente@corp.com'] },
  { id: 'weeklyInventory', label: 'SEMANAL | Ventas por prod', frequency: 'semanal', day: 'Lunes', time: '09:00', active: true, format: ['excel'], recipients: ['compras@corp.com'] },
  { id: 'monthlyInventory', label: 'MENSUAL | Estado inventario', frequency: 'mensual', date: '01', time: '07:00', active: false, format: ['excel', 'pdf'], recipients: ['compras@corp.com'] }
];

export const SEND_HISTORY: SendHistory[] = [
  { id: 'h1', status: 'ok', datetime: '22/11 08:05', report: 'Ventas del dia', target: 'juan@corp.com', channel: 'email' },
  { id: 'h2', status: 'ok', datetime: '22/11 08:05', report: 'Ventas del dia', target: 'admin@corp.com', channel: 'email' },
  { id: 'h3', status: 'error', datetime: '21/11 08:07', report: 'Ventas del dia', target: 'juan@corp.com', channel: 'email' }
];

export const ACTIVE_ITEM_TO_REPORT: Record<string, ReportId> = {
  'informes-periodo': 'ventas-fecha',
  'informes-top': 'ventas-producto',
  'informes-ganancias': 'finan-ganancias',
  'informes-rotacion': 'inventario-rotacion'
};
