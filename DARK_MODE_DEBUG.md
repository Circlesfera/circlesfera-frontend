# 🐛 Guía de Debugging - Dark Mode

## 📋 Pasos para Verificar el Problema

### 1. Verificar que el Botón Funciona

1. **Abre la consola del navegador** (F12 o Cmd+Option+I)
2. **Ve a la pestaña Console**
3. **Haz click en el botón de tema** (sol/luna en el Sidebar)
4. **Deberías ver estos mensajes:**
   ```
   Theme changed to: dark
   HTML classes: [las clases del html]
   ```

**Si NO ves estos mensajes:**
- El botón no está ejecutando el código
- Puede haber un error de JavaScript bloqueando la ejecución

### 2. Verificar la Clase `dark` en el HTML

1. **Abre las DevTools** (F12)
2. **Ve a la pestaña Elements**
3. **Selecciona el elemento `<html>`** (el primero)
4. **Verifica las clases:**
   - En modo claro: NO debe tener la clase `dark`
   - En modo oscuro: DEBE tener la clase `dark`

**Si la clase `dark` NO se agrega:**
- Hay un problema con el JavaScript
- Revisa la consola por errores

### 3. Verificar que Tailwind está Funcionando

1. **Inspecciona cualquier elemento** (click derecho > Inspeccionar)
2. **Busca un elemento con `bg-white dark:bg-gray-900`**
3. **En las DevTools, verifica:**
   - Sin clase `dark`: debe tener `background-color: white`
   - Con clase `dark`: debe tener `background-color: rgb(17, 24, 39)` (gray-900)

**Si los estilos `dark:` NO se aplican:**
- Tailwind no está compilando correctamente
- Ejecuta: `npm run dev` y recarga

### 4. Verificar localStorage

1. **Abre la consola**
2. **Escribe:** `localStorage.getItem('theme')`
3. **Debe mostrar:** `"light"` o `"dark"`

**Si muestra `null`:**
- El tema no se está guardando
- Hay un problema con el ThemeSwitcher

## 🔧 Soluciones Comunes

### Problema: El botón no hace nada

**Solución:**
```bash
# Reinicia el servidor de desarrollo
cd circlesfera-frontend
npm run dev
```

### Problema: Los estilos no cambian

**Verifica que el archivo `tailwind.config.js` tiene:**
```js
module.exports = {
  darkMode: 'class', // ← DEBE estar en 'class'
  // ...
}
```

### Problema: Flash de contenido blanco

**Verifica que `app/layout.tsx` tiene el script en el `<head>`:**
```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          const theme = localStorage.getItem('theme');
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {}
      })();
    `,
  }}
/>
```

## 📸 Capturas de Pantalla Útiles

Por favor, envíame capturas de:

1. **Consola del navegador** después de hacer click en el botón
2. **Elemento `<html>`** en las DevTools mostrando las clases
3. **Cualquier error** en rojo en la consola
4. **Un componente específico** que se ve mal (inspeccionar elemento)

## 🔍 Comandos de Debugging

Ejecuta estos comandos en la consola del navegador:

```javascript
// Ver tema actual
console.log('Theme:', localStorage.getItem('theme'));

// Ver clases del HTML
console.log('HTML classes:', document.documentElement.className);

// Forzar dark mode
document.documentElement.classList.add('dark');
localStorage.setItem('theme', 'dark');

// Forzar light mode
document.documentElement.classList.remove('dark');
localStorage.setItem('theme', 'light');

// Ver estilos computados de un elemento
const el = document.querySelector('.bg-white');
console.log('Computed styles:', window.getComputedStyle(el).backgroundColor);
```

## 📝 Información que Necesito

Para ayudarte mejor, necesito saber:

1. **¿Ves los console.logs** cuando haces click en el botón?
2. **¿La clase `dark` se agrega** al elemento `<html>`?
3. **¿Qué navegador** estás usando? (Chrome, Firefox, Safari, etc.)
4. **¿Hay algún error** en la consola?
5. **¿Qué componentes específicos** se ven mal?

## 🚀 Última Opción: Reset Completo

Si nada funciona:

```bash
# 1. Detener el servidor
Ctrl+C

# 2. Limpiar caché de Next.js
rm -rf .next

# 3. Limpiar node_modules (opcional, toma tiempo)
rm -rf node_modules
npm install

# 4. Reiniciar servidor
npm run dev

# 5. En el navegador:
# - Abrir DevTools
# - Click derecho en el botón de recargar
# - Seleccionar "Vaciar caché y recargar forzosamente"
```

