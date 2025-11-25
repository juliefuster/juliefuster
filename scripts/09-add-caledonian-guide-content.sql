-- Script para añadir contenido de la Guía de Incidencias del Hotel Caledonian a la guía virtual

-- 1. INCIDENCIAS GENERALES
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Registro de Incidencias',
  E'# Registro de Incidencias\n\nSiempre que tengamos una incidencia, procederemos a resolverla de la mejor manera posible siguiendo los pasos marcados por su respectivo manual.\n\n## Procedimiento de Registro\n\nCuando ocurra una incidencia, aparte de solventarla, tendremos que dejar constancia de ella en el documento de Registro Incidencias de cada hotel que encontraremos en la carpeta Plantillas de uso diario.\n\n## Datos a Registrar\n\n- **Nº de ticket**: seguir el orden que aparece en la lista\n- **Estado** (resuelto/abierto): indicar si está resuelto o aún no se ha solucionado\n- **Descripción**: redactar de forma clara y detallada\n- **Nombre de la persona**\n- **Fecha y hora**\n- **Comentarios adicionales**: solo si es necesario indicar algún dato más\n\nEs importante anotar todo aquello que esté fuera de la normalidad durante el turno.',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 2. AGUA - INSTALACIÓN
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Instalación de Agua - Sistema General',
  E'# Instalación de Agua\n\nEn el hotel Caledonian hay cinco tipos de conductos con agua: dos para el clima y tres para el agua sanitaria. El recorrido que hacen es desde la azotea, bajando por el patio interior y desviándose en cada planta y cada habitación.\n\n## Conductos del Clima\n\n- **Calefacción**: sale de la sala de máquinas (calderas)\n- **Aire acondicionado**: sale de la parte izquierda de la azotea donde está la máquina de A/C\n\n## Conductos de Agua Sanitaria\n\n1. **Agua caliente**: el agua sube de la calle y entra en el acumulador de la sala de máquinas. Allí se acumula y se calienta a través de un circuito cerrado que va desde la caldera, pasa por dentro del acumulador por un conducto, y vuelve a la caldera.\n\n2. **Agua fría**: el agua fría sube de la calle hasta al cuarto de calderas y de allí se reparte a las diferentes plantas.\n\n3. **Agua de retorno**: es un circuito cerrado que entra por un lado del acumulador y sale por el otro. Hace que al abrir o cerrar un grifo, el agua salga directamente caliente sin esperar.\n\n## Ubicación de Llaves de Paso\n\nLas llaves de paso de cada planta se encuentran en el falso techo del pasillo de cada planta a la altura de los conductos del patio interior.',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 3. AGUA - INCIDENCIAS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Fuga de Agua - Procedimiento',
  E'# Procedimiento ante Fuga de Agua\n\n## Pasos a Seguir\n\n1. **Comprobar el origen**: verificar que ningún cliente se haya dejado el grifo abierto\n\n2. **Localizar la habitación** de donde procede la fuga\n\n3. **Buscar la escalera** situada en el S2 para acceder a la llave de paso\n\n## Ubicación de Llaves de Paso por Habitación\n\n- **Habitaciones 209-216 y 605-612**: Encima de la puerta de entrada por fuera de la habitación\n- **Resto de habitaciones**: Dentro del baño, en la trampilla del techo\n\n## Procedimiento de Cierre\n\n1. Con la escalera, abrir el falso techo o la trampilla\n2. Cerrar las llaves de paso para detener la fuga\n\n## Si la Fuga es del Pasillo\n\n- Cerrar las llaves de paso de toda la planta (ubicadas en el pasillo)\n- Usar la escalera del S2 para acceder\n- Abrir la placa del techo y cerrar las llaves\n- Toda la planta quedará sin agua temporalmente',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 4. ELECTRICIDAD - INSTALACIÓN
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Sistema Eléctrico - Cuadros y Distribución',
  E'# Instalación Eléctrica\n\nLa instalación eléctrica está formada por diferentes cuadros eléctricos en distintas partes del hotel, divididos en cuatro grupos:\n\n## 1. Cuadro General\n\n- Controla toda la electricidad del hotel\n- Conecta con la red de la calle\n- Ubicación: Armario de la sala de desayunos (entresuelo)\n- **NUNCA debe tocarse como norma general**\n- Debe estar siempre en posición de encendido (hacia arriba)\n\n## 2. Subcuadro Desayunos\n\n- Ubicación: Armario de la sala de desayunos\n- Controla cada planta del hotel\n- Cada zona está etiquetada correspondientemente\n\n## 3. Subcuadro Pisos (Office)\n\n- Un subcuadro en el office de cada piso\n- Cada habitación tiene su diferencial\n- Todos están etiquetados por habitación\n\n## 4. Subcuadro Habitaciones\n\n- Cada habitación tiene su propio cuadro\n- Ubicación: Detrás de la puerta o al lado\n\n## Nota sobre SAI\n\nEn recepción hay dos tipos de enchufes:\n- **Blancos**: Conectados directamente a la tensión\n- **Rojos**: Conectados al SAI (batería que mantiene ordenador y teléfono funcionando durante cortes)',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 5. ELECTRICIDAD - INCIDENCIAS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Corte de Luz - Procedimiento de Resolución',
  E'# Procedimiento ante Corte de Luz\n\n## Sin luz en el hotel completo\n\n1. **Verificar** si es una incidencia general en la ciudad (mirar si hay luz en la calle)\n2. **Si es general**: Llamar a ENDESA (Averías Luz Cataluña - teléfono gratuito: 800 76 07 06)\n3. **Si es del hotel**: Comprobar en cada zona si los diferenciales están subidos o no\n\n## Sin luz en una habitación\n\nRecorrido de menor a mayor subcuadro:\n1. Subcuadro de la habitación\n2. Subcuadro de la planta (office)\n3. Subcuadro general\n4. Cuadro general\n\n## Diferencial que salta continuamente\n\n- Si un diferencial de habitación salta repetidamente y afecta toda la planta:\n  - Dejar ese diferencial bajado\n  - Subir todos los demás\n  - Así se evita que otros clientes se queden sin tensión\n\n## Importante\n\nPara que funcione el suministro de luz, todos los diferenciales han de estar hacia arriba. Si hay alguno hacia abajo, significa que hay algo que no funciona.',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 6. ALARMA DE INCENDIOS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Alarma de Incendios - Procedimiento',
  E'# Alarma contra Incendios\n\nLa alarma contra incendios está situada en la recepción.\n\n## Pasos cuando Suena la Alarma\n\n1. Verificar la zona que indica la central\n2. Si hay fuego real, llamar a bomberos: **080**\n3. Si es falsa alarma, rearmar la central\n\n## Zonas de la Alarma\n\n- ZONA 1: 6º Planta\n- ZONA 2: 5º Planta\n- ZONA 3: 4º Planta\n- ZONA 4: 3º Planta\n- ZONA 5: 2º Planta\n- ZONA 6: 1º Planta\n- ZONA 7: Entresuelo\n- ZONA 8: Cocina\n\n## Anular un Detector\n\nSi la alarma no para de saltar sin fuego:\n1. ESC\n2. Anulado\n3. OK\n4. Anular zona\n5. Seleccionar zona\n6. OK\n7. ESC (hasta volver al inicio)\n\n## Puertas Cortafuego\n\nCuando salta la alarma, las puertas cortafuego de cada planta se cierran automáticamente. Si fue falsa alarma, hay que rearmar la central y abrir las puertas.\n\n## Último Recurso\n\nSi no se puede parar la alarma:\n1. Bajar el diferencial "ALARMA FUEGO" del armario de recepción\n2. Dar al interruptor del cable azul en la caja de la alarma',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 7. PLAN DE SEGURIDAD INCENDIOS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Plan de Seguridad en Caso de Incendio',
  E'# Plan de Seguridad en Caso de Incendio\n\n## Actuación en Caso de Incendio\n\n1. Coger una llave maestra y subir a la habitación\n2. Tocar con la palma de la mano la puerta (si no está caliente, abrir)\n3. **Al abrir la puerta**: colocarse siempre a un lado, nunca frente a ella (puede haber explosión de gases)\n4. Dar la voz de alarma y **COMUNICARSE CON LOS BOMBEROS: 080**\n5. Evacuar inmediatamente al personal y clientes de manera ordenada\n6. Dejar las puertas cerradas una vez comprobado que no hay nadie dentro\n7. Aplicar medidas de lucha contra fuego (extintores, mangueras) **SIN EXPONERSE A RIESGOS PERSONALES**\n\n## Prevención de Accidentes Eléctricos\n\n- Evitar acceso no autorizado a cajas de fuerza\n- Mantener permanentemente el sistema alámbrico\n- Protegerse contra contacto con equipos con potencial eléctrico\n- Evitar empalmes o aislarlos debidamente\n- Mantener en buen estado interruptores y tomas\n- No tocar aparatos eléctricos con manos mojadas\n\n## Actuación ante Accidente Eléctrico\n\n1. Actuar con rapidez y serenidad\n2. Desconectar la corriente si es posible\n3. Liberar a la víctima con material aislante\n4. Avisar a un médico\n\n## Uso de Extintores\n\n- No apuntar directamente a líquidos inflamables (se esparcirá)\n- Acercarse con corrientes de aire por la espalda\n- Usar toda la carga hasta eliminar totalmente el fuego\n- En cuarto con humo, mantener cabeza cerca del suelo',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 8. PUERTAS - APERTURA DE EMERGENCIA
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Apertura de Emergencia de Puertas',
  E'# Apertura de Emergencia de Puertas\n\n## Equipo Necesario\n\n- Ordenador portátil Lenovo con programa Lock Service 3G\n- Cable de conexión a cerradura\n\n## Procedimiento\n\n1. **Encender el ordenador** y conectar el cable\n2. **Quitar la tapa** de la cerradura girándola en sentido contrario a las agujas del reloj\n3. **Conectar el cable** en la cerradura\n4. **Abrir Lock Service 3G**\n5. Ir a **Tools → Power Open**\n\n## Descargar Power Open Token\n\nEl Power Open Token caduca a los pocos minutos (permite abrir todas las puertas del hotel).\n\n1. Ir a **Setup → Download Data From Server**\n2. Seleccionar **Power Open Token**\n3. Clicar en **Download**\n4. Usuario: recepcion / Contraseña: 0574\n5. Una vez descargado, volver a **Tools → Power Open**\n6. Clicar en **Open** (con el cable conectado a la cerradura)\n\n## Después de Abrir\n\nSeguir el procedimiento de "Reprogramar Cerradura" para que la puerta vuelva a funcionar normalmente.',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 9. PUERTAS - REPROGRAMAR CERRADURA
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Reprogramar Cerradura de Habitación',
  E'# Reprogramar Cerradura\n\n## Procedimiento en Lock Service 3G\n\nDentro del apartado **Initiation**, seguir estos pasos en orden:\n\n### 1. Set System ID in Lock\n- Conectar cable en la cerradura\n- Clicar en **Set**\n\n### 2. Initialize Lock\n- Seleccionar la habitación correspondiente\n- Clicar en **Initialize**\n\n### 3. Set Time in Lock\n- Clicar en **Set Time**\n\n### 4. Configure Lock\n- Clicar en **Set**\n- No modificar el desplegable (debe ser "4.5V battery, 4.5V Lock case")\n\n### 5. Upload Firmware\n- Escoger firmware **3.17.37.5** (primero de versión Standard Lock)\n- Clicar en **Upload**\n- Esperar a que cargue la barra verde\n- Una vez cargada, la puerta estará programada\n\n## Consultar Estado de Baterías\n\n1. Abrir Lock Service 3G\n2. Menú **Readout → Parameters**\n3. Clicar en **Readout**\n4. Seleccionar pestaña **Lock** para ver el voltaje',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 10. PUERTAS - CANCELAR TARJETA MAESTRA
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Cancelar Tarjeta Maestra Perdida',
  E'# Cancelar Tarjeta Maestra\n\n**IMPORTANTE**: Realizar este procedimiento lo antes posible si se pierde una tarjeta maestra.\n\n## Procedimiento\n\n1. **Function cards → Cancel card**\n2. En **Cardholder**, clicar los tres puntos y escoger una tarjeta que será la que borrará la perdida\n3. Seleccionarla y dar a **Select**\n4. Poner de validez **1 día**\n5. Dar a **Card list**\n6. Seleccionar **Cards** y dar a **OK**\n7. Buscar el nombre de la tarjeta a cancelar (o seleccionar varias)\n8. Dar a **Cancel Card**\n\n## Deshabilitar en Cerraduras\n\nUna vez hecha la tarjeta de cancelación:\n- Pasarla por delante de TODAS las cerraduras\n- Aparecerá una luz naranja parpadeante y una verde\n- Esto deshabilitará la tarjeta perdida en cada cerradura',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 11. CAJAS FUERTES
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Apertura de Cajas Fuertes',
  E'# Cajas Fuertes\n\n## Instrucciones de Funcionamiento Normal\n\nLas cajas fuertes se abren y cierran con un código de 4 dígitos:\n1. Clicar **RESET**\n2. Introducir 4 dígitos\n3. Clicar **LOCK**\n\nPara abrir: introducir el mismo número y se abrirá.\n\n## Apertura de Emergencia\n\nCuando un cliente anterior dejó la caja cerrada y el nuevo cliente no puede abrirla:\n\n### Equipo Necesario\n- Pinkey (en cajón de recepción)\n- Instrucciones en la caja del Pinkey\n\n### Procedimiento\n\n1. Poner **Pinkey**\n2. Apretar **1**\n3. Saldrá "Ser" en pantalla\n4. Poner código **2661** o **9934**\n5. **Lock**\n6. Se abre la caja\n\n### Solución de Problemas\n\n- A veces se bloquea el cierre: dar un **golpe seco** cuando los números parpadean\n- Repetir el proceso de apertura\n- Si un código no funciona, probar el otro',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 12. INTERNET/WIFI - RACK
INSERT INTO guia_virtual (titulo, descripcion, departimento, hotel, modificado_por) VALUES (
  'Sistema de Internet y WiFi - Rack',
  E'# Sistema de Internet y WiFi\n\n## Ubicación del Rack\n\nTodos los aparatos de informática se encuentran en la sala del Rack (Sótano 1).\n\n**IMPORTANTE**: \n- Solo entrar al rack si falla algún aparato\n- Siempre con aprobación de un superior\n- Llave de acceso: detrás del casillero en recepción\n\n## Redes del Hotel\n\n1. **Red de trabajadores** (Personal)\n2. **Red de clientes** (WiFi público)\n\n## Equipos en el Rack\n\n- **DSR-1000N Clientes**: Router para red WiFi de clientes\n- **DSR-500N Personal**: Router para red de trabajadores\n- **Routers Movistar** (2 unidades): Proveen conexión principal\n\n## IPs de Referencia\n\n### Hotel Caledonian\n- Red trabajadores: **80.24.157.103** (fija)\n- Red clientes: **83.x.x.x** (variable)\n\n### Hotel Chi\n- Red trabajadores: **83.56.24.13** (fija)\n- Red clientes: **83.x.x.x** (variable)\n\n**Verificar IP en**: myip.es',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 13. INTERNET/WIFI - INCIDENCIAS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Problemas de Internet y WiFi - Resolución',
  E'# Resolución de Problemas de Internet\n\n## WiFi de Clientes No Funciona\n\n### Un solo cliente afectado\n1. Sugerir que apague el WiFi del dispositivo\n2. Olvidar la red\n3. Volver a conectarse a **caledonianwifi**\n\n### Varios clientes afectados\n1. Acceder a la sala del Rack\n2. Reiniciar **DSR-1000N Clientes** (botón trasero)\n3. Esperar unos minutos hasta que se ponga en marcha\n\n## Internet de Trabajadores No Funciona\n\nSi fallan ambas redes (trabajadores y clientes):\n\n1. **Reiniciar los dos routers Movistar**\n   - Apagar y encender por el botón posterior\n   - **NUNCA** dar al reset (desconfigura servidor)\n2. Esperar a que se pongan en marcha\n3. Comprobar conexión\n4. Si persiste: reiniciar **DSR-500N Personal**\n\n## Programa ACI No Funciona\n\nEl ACI está conectado al servidor del Caledonian, que va a la red de trabajadores del Chi.\n\n### Diagnóstico por Hotel\n\nVer tabla de soluciones en la guía completa según:\n- Hotel donde ocurre el problema\n- IP actual de conexión\n- Estado de Internet\n\n### Soluciones Comunes\n- Reiniciar DSR-1000 Personal del hotel correspondiente\n- Reiniciar routers de trabajadores\n- Verificar conexión entre hoteles',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 14. TAQUILLAS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Taquillas de Clientes',
  E'# Taquillas de Almacenamiento\n\nLas taquillas están disponibles para que los clientes almacenen su equipaje antes del check-in o después del check-out.\n\n## Uso Normal\n\n1. Pulsar **START**\n2. Escoger **4 dígitos**\n3. Pulsar **✓**\n\n## Apertura de Emergencia\n\nSi el cliente no recuerda el código, hay dos opciones:\n\n### OPCIÓN 1: Con Mando\n1. Pulsar **START**\n2. Acercar el mando al círculo del teclado\n3. Presionar el botón del mando\n\n### OPCIÓN 2: Con Código Maestro\n1. Pulsar **START**\n2. Introducir código: **010322**\n3. Pulsar **✓**\n\n**Ubicación del mando**: Cajón de recepción',
  'Recepción',
  'Caledonian',
  'Sistema'
);

-- 15. ASCENSORES - FUNCIONAMIENTO
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Ascensores - Información General',
  E'# Ascensores del Hotel\n\n## Dos Ascensores\n\n1. **Ascensor de clientes**: Entresuelo a 6ª planta\n2. **Ascensor de servicio** (montacargas): Sótano 2 a 6ª planta\n\n## Salas de Máquinas\n\nUbicación: 7ª planta (subiendo por escalera)\n- **Derecha**: Sala del montacargas (servicio)\n- **Izquierda**: Sala del ascensor de clientes\n\n## Cuadros Eléctricos\n\nEn el entresuelo (desayunos) hay:\n- Magnetotérmico ascensor\n- Diferencial ascensor\n- Magnetotérmico montacargas\n- Diferencial montacargas\n\n## Tipos de Llaves\n\nEn la cajonera de recepción hay dos tipos de llaves para gestión de ascensores.\n\n## ⚠️ IMPORTANTE\n\nNunca utilizar el ascensor si se está solo en el hotel. Si ocurriera algo, no habría nadie que ayude.',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 16. ASCENSORES - INCIDENCIAS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Ascensor Parado - Procedimiento de Resolución',
  E'# Ascensor Parado - Resolución\n\n## Reinicio del Ascensor\n\n1. Ir al panel de la sala de desayunos (entresuelo)\n2. Localizar diferencial correspondiente:\n   - "Ascensor" para el de clientes\n   - "Montacargas" para el de personal\n3. Bajar el diferencial durante unos segundos\n4. Volver a subir\n\n## Si Funciona Después del Reinicio\n\n- Anotar incidencia en RHR574_Registro Incidencias\n- Avisar a dirección\n\n## Si NO Funciona Después del Reinicio\n\n1. Dejar los diferenciales subidos\n2. Abrir puertas del ascensor en 6ª planta hasta máxima apertura\n3. Acompañar hasta que se cierre bien\n4. Repetir en 5ª planta y seguir bajando\n5. Es probable que vuelva a funcionar antes de llegar a planta baja\n\n## Si Sigue Sin Funcionar\n\n1. **Llamar a Schindler: 900 400 272**\n2. Informar de la avería\n3. Si es ascensor de clientes: habilitar ascensor de servicio para clientes\n\n### Habilitar Ascensor de Servicio\n\n1. Abrir puertas de office de todas las plantas\n2. Colocar carteles (de cajonera de recepción):\n   - "Ascensor averiado" en todas las plantas (ascensor clientes)\n   - "Ascensor de servicio" en todas las plantas (montacargas)\n   - "Recepción" en planta baja (frente al ascensor servicio)\n   - "Desayunos" en entresuelo (frente al ascensor servicio)\n   - Cartel en "L" dentro del ascensor servicio (tapa botones sótanos)\n\n## Parte de Schindler\n\nCuando vengan los técnicos:\n1. Rellenar parte de incidencias de Schindler\n2. Guardar copia en PDF\n3. Enviar a: jamalda455@gmail.com\n4. Recoger carteles y guardar en cajón',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 17. ASCENSORES - PERSONA ATRAPADA
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Persona Atrapada en Ascensor - Emergencia',
  E'# Persona Atrapada en Ascensor\n\n## ⚠️ IMPORTANTE - Primera Acción\n\n**Localizar** donde está parado y **tomar contacto** con las personas dentro para:\n- Que sepan que se conoce la situación\n- Calmarlas y evitar pánico o ansiedad\n- Mantener comunicación constante\n\n## Procedimiento de Rescate\n\n### 1. Bajar Diferenciales\n\n**ANTES DE CUALQUIER ACCIÓN**: Bajar los diferenciales del ascensor correspondiente en el panel de desayunos.\n\n### 2. Intentar Reinicio\n\n- Avisar a los ocupantes que se apagará la luz unos segundos\n- Realizar reinicio estándar (bajar/subir diferencial)\n\n### 3. Si el Reinicio NO Funciona\n\n#### A) Ascensor Parado en una Planta\n\n1. Coger llave de apertura de emergencia\n2. Introducir en parte superior del marco del ascensor\n3. Dar media vuelta (lleva muelle, mantener presionado)\n4. Empujar la puerta hasta abrirla\n5. Evacuar persona/s atrapada/s\n6. Cerrar puerta y dejar llave en su sitio\n\n#### B) Ascensor Parado Entre Plantas\n\n1. **Llamar a Schindler: 900 400 272**\n2. Informar que hay personas dentro (urgencia)\n3. Mantener comunicación con atrapados\n4. Tranquilizar mientras llega ayuda\n\n## Movimiento Manual (SOLO EMERGENCIA EXTREMA)\n\n**Solo en casos de**:\n- Incendio\n- Ansiedad severa\n- Infarto\n- Cuando NO se puede esperar al servicio técnico\n\n### Requisitos\n\n- **Dos personas** obligatorio\n- Todas las llaves de ascensor\n- Diferenciales bajados\n\n### Procedimiento (ver guía detallada)\n\n1. Determinar entre qué pisos está parado\n2. Decidir si subir o bajar\n3. Acceder a sala de máquinas (7ª planta)\n4. Usar palanca para desbloquear frenos\n5. Girar rueda amarilla en dirección correcta\n6. Persona de apoyo indica cuando está alineado\n7. Evacuar personas\n8. Cerrar todo y dejar llaves en su sitio\n\n**RECORDATORIO**: Esta operación manual es extremadamente peligrosa y solo para situaciones límite.',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 18. ASCENSORES - REVISIÓN
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Revisión Mensual de Ascensores',
  E'# Revisión Mensual - Schindler\n\nUna vez al mes, Schindler realiza revisión de ambos ascensores.\n\n## Coordinación de Cita\n\n1. **Schindler llama** para proponer cita\n2. **Acordar hora con gobernanta**\n   - Si no está, coger teléfono y recado\n   - Preferible: tardes a primera hora\n   - Días de baja ocupación: lunes o martes\n   - Evitar: jueves y viernes (si se avería después, técnicos no vienen hasta lunes)\n3. **Informar a gobernanta** de día y hora acordados\n4. **Anotar en cambio de turno**\n\n## Día de la Revisión\n\n### Antes de que Llegue el Técnico\n\n- Recordar a la gobernanta que vendrá el técnico\n\n### Durante/Después de la Revisión\n\n1. **Técnico debe informar** de:\n   - Qué ha realizado (revisión normal o reparación)\n   - Qué piezas ha sustituido\n   - Cualquier observación o recomendación\n\n2. **Comprobar funcionamiento**\n   - Verificar con el técnico que ambos ascensores funcionen correctamente\n   - Probar subidas y bajadas\n\n3. **Documentación**\n   - Obtener parte de revisión firmado\n   - Guardar copia en PDF\n   - Enviar a: jamalda455@gmail.com',
  'Mantenimiento',
  'Caledonian',
  'Sistema'
);

-- 19. CONTRASEÑAS Y CÓDIGOS
INSERT INTO guia_virtual (titulo, descripcion, departamento, hotel, modificado_por) VALUES (
  'Resumen de Contraseñas y Códigos',
  E'# Resumen de Contraseñas y Códigos\n\n## VINGCARD VISION\n\n- Usuario: **recepcion**\n- Contraseña: **0574**\n\n- Usuario: **sym**\n- Contraseña: **sym**\n\n## ACI (Programa de Gestión)\n\n- Usuario: **recepcion**\n- Contraseña: **574**\n\n## Cajas Fuertes (Apertura Emergencia)\n\n- Código 1: **2661**\n- Código 2: **9934**\n\n## Taquillas (Apertura Emergencia)\n\n- Código maestro: **010322**\n\n## Contactos de Emergencia\n\n- **Bomberos**: 080\n- **ENDESA** (Averías Luz Cataluña): 800 76 07 06\n- **Schindler** (Ascensores): 900 400 272\n\n⚠️ **IMPORTANTE**: Esta información es confidencial y solo para uso del personal autorizado.',
  'Administración',
  'Caledonian',
  'Sistema'
);

-- Commit the transaction
COMMIT;
