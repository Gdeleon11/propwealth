'use client'

export default function Settings() {
  return (
    <div className="px-6 py-4 max-w-3xl mx-auto">
      <section className="mb-6">
        <h2 className="text-[32px] font-semibold text-primary mb-1">Configuración</h2>
        <p className="text-base text-on-surface-variant">Administra tu cuenta, notificaciones y preferencias.</p>
      </section>

      {/* Profile */}
      <div className="bg-white border border-outline-variant rounded-xl p-6 card-shadow mb-4 flex items-center gap-4">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVBGi0X1dH9qvZS8AqkFZalRpMDg5Zdm_z34dLrEIZ4mGMs5SOM8EMEJlcmTP0BiJbIUD4rBgH2DbRhy-v1Y1tabOY-LThrvWKu52m0tFXKo2RJIvB3V3jFe2RwygIny88L1qBeQ8_Nr1QokRghP2K3kezEkO_UQIU0y5CXVJQIqvO5Dkzn-6jMTmn23U70widlG51yC-wrkLp_S-aVMNCq8FodcoKfUh78dw8RKJlaeLwexU0-gZyKg"
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-primary-container"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-primary">Eduardo Pérez</h3>
          <p className="text-on-surface-variant">eduardo.perez@propwealth.com</p>
          <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[10px] font-bold mt-1 inline-block">PLAN EJECUTIVO PRO</span>
        </div>
        <button className="px-4 py-2 border border-outline text-primary rounded-lg text-[11px] font-bold tracking-wider hover:bg-surface-container-low">EDITAR</button>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">NOTIFICACIONES</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            {[
              { label: 'Alertas de pago', desc: 'Recibe notificaciones de pagos vencidos', on: true },
              { label: 'Recordatorios de mantenimiento', desc: 'Alertas 7 días antes del servicio', on: true },
              { label: 'Reportes semanales', desc: 'Resumen financiero cada lunes', on: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-base text-primary">{item.label}</p>
                  <p className="text-sm text-on-surface-variant">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.on} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"/>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">PREFERENCIAS</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            {[
              { label: 'Idioma', val: 'Español' },
              { label: 'Moneda', val: 'USD — Dólar Estadounidense' },
              { label: 'Zona horaria', val: 'UTC-5, Ciudad de México' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low">
                <div>
                  <p className="font-semibold text-base text-primary">{item.label}</p>
                  <p className="text-sm text-on-surface-variant">{item.val}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden mb-4">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">SEGURIDAD</h3>
          </div>
          <div className="divide-y divide-outline-variant">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low">
              <p className="font-semibold text-base text-primary">Cambiar contraseña</p>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low">
              <div>
                <p className="font-semibold text-base text-primary">Autenticación de dos factores</p>
                <p className="text-sm text-on-surface-variant">Activa para mayor seguridad</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-low">
              <p className="font-semibold text-base text-error">Cerrar sesión</p>
              <span className="material-symbols-outlined text-error">logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
