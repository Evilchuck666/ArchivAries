# ArchivAries — Reglas del proyecto

## Internacionalización (i18n)

**Regla obligatoria:** Cualquier string literal visible al usuario que se añada o edite en el frontend DEBE usar el sistema de traducción `react-i18next`. Nunca dejar texto hardcodeado en español (ni en ningún otro idioma) directamente en los componentes `.tsx`.

### Cómo aplicarlo

1. **Añadir la key** en los dos archivos de locale correspondientes al namespace del componente:
   - `frontend/public/locales/es/<namespace>.json`
   - `frontend/public/locales/ca/<namespace>.json`

2. **Usar `t()`** en el componente:
   ```tsx
   const { t } = useTranslation('namespace');
   // ...
   <p>{t('mi_key')}</p>
   ```

3. **Namespaces disponibles** (un archivo por sección):
   - `common` — textos compartidos, navegación, acciones, estados, roles
   - `auth` — login/logout
   - `dashboard` — panel principal
   - `members` — miembros y perfil
   - `events` — eventos
   - `documents` — documentación
   - `news` — avisos
   - `lore` — lore

4. **Textos comunes reutilizables** ya definidos en `common.json`:
   - Acciones: `t('actions.save')`, `t('actions.cancel')`, `t('actions.delete')`, `t('actions.edit')`, `t('actions.view_all')`, `t('actions.save_changes')`…
   - Estados: `t('status.ACTIVE')`, `t('status.draft')`…
   - Roles: `t('roles.MEMBER')`…
   - Para usarlos desde otro namespace: `t('actions.cancel', { ns: 'common' })` o `const { t: tc } = useTranslation('common')`

### Lo que NO está permitido

```tsx
// ❌ Mal — string hardcodeado
<button>Guardar cambios</button>
<Badge>Borrador</Badge>
<p>Ha ocurrido un error.</p>

// ✅ Bien — usando t()
<button>{t('save_changes')}</button>
<Badge>{t('draft')}</Badge>
<p>{t('save_error')}</p>
```
