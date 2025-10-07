# Configuración de SharePoint para la App de Mantenimiento

Esta aplicación puede conectarse a SharePoint para almacenar las averías. Sigue estos pasos para configurar la integración.

## Paso 1: Crear una App Registration en Azure AD

1. Ve al [Azure Portal](https://portal.azure.com)
2. Navega a **Azure Active Directory** > **App registrations**
3. Haz clic en **New registration**
4. Configura:
   - **Name**: Hotel Maintenance App
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Déjalo en blanco por ahora
5. Haz clic en **Register**

## Paso 2: Obtener las Credenciales

### Client ID y Tenant ID
1. En la página de tu app registration, copia:
   - **Application (client) ID** → Este es tu `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → Este es tu `AZURE_TENANT_ID`

### Client Secret
1. Ve a **Certificates & secrets**
2. Haz clic en **New client secret**
3. Añade una descripción y selecciona la expiración
4. Haz clic en **Add**
5. **IMPORTANTE**: Copia el **Value** inmediatamente → Este es tu `AZURE_CLIENT_SECRET`
   (No podrás verlo de nuevo después)

## Paso 3: Configurar Permisos

1. Ve a **API permissions**
2. Haz clic en **Add a permission**
3. Selecciona **Microsoft Graph**
4. Selecciona **Application permissions**
5. Busca y añade estos permisos:
   - `Sites.ReadWrite.All`
   - `Sites.Manage.All`
6. Haz clic en **Add permissions**
7. **IMPORTANTE**: Haz clic en **Grant admin consent** y confirma

## Paso 4: Crear la Lista en SharePoint

1. Ve a tu sitio de SharePoint
2. Crea una nueva lista llamada **"Mantenimiento"** (o el nombre que prefieras)
3. Añade las siguientes columnas:

| Nombre de Columna | Tipo | Requerido |
|-------------------|------|-----------|
| Title | Single line of text | Sí (por defecto) |
| Description | Multiple lines of text | No |
| Category | Single line of text | Sí |
| Location | Single line of text | Sí |
| Priority | Choice (baja, media, alta, urgente) | Sí |
| Status | Choice (pendiente, en_progreso, resuelta) | Sí |
| ReportedBy | Single line of text | Sí |
| AssignedTo | Single line of text | No |
| ResolvedAt | Date and time | No |

## Paso 5: Configurar Variables de Entorno

Añade estas variables de entorno a tu proyecto en Vercel:

\`\`\`env
AZURE_TENANT_ID=tu-tenant-id-aqui
AZURE_CLIENT_ID=tu-client-id-aqui
AZURE_CLIENT_SECRET=tu-client-secret-aqui
SHAREPOINT_SITE_URL=https://tuempresa.sharepoint.com/sites/tunombredesitio
SHAREPOINT_LIST_NAME=Mantenimiento
\`\`\`

### Cómo obtener la URL del sitio:
1. Ve a tu sitio de SharePoint
2. Copia la URL completa hasta `/sites/nombre-del-sitio`
3. Ejemplo: `https://contoso.sharepoint.com/sites/hotel-management`

## Paso 6: Verificar la Conexión

1. Despliega tu aplicación con las variables de entorno configuradas
2. La aplicación automáticamente detectará la configuración de SharePoint
3. Si las credenciales son correctas, comenzará a usar SharePoint
4. Si hay algún error, la aplicación usará datos de prueba locales

## Solución de Problemas

### Error: "Azure AD credentials not configured"
- Verifica que todas las variables de entorno estén configuradas correctamente
- Asegúrate de que no haya espacios extra en los valores

### Error: "SharePoint list not found"
- Verifica que el nombre de la lista coincida exactamente (sensible a mayúsculas)
- Asegúrate de que la lista existe en el sitio especificado

### Error: "Insufficient privileges"
- Verifica que los permisos de API estén configurados correctamente
- Asegúrate de haber dado el consentimiento de administrador

### La app sigue usando datos de prueba
- Verifica que todas las 5 variables de entorno estén configuradas
- Revisa los logs de la aplicación para ver mensajes de error específicos
