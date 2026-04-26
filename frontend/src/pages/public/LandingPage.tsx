import { Link } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

export function LandingPage() {

  return (
    <div className="text-slate-200">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <span className="text-7xl mb-6 block">🐐</span>
        <h1 className="text-5xl md:text-6xl font-serif text-amber-200 mb-4">Aries Ferrus</h1>
        <p className="text-xl text-slate-400 mb-3">Compañía de Rol en Vivo y Recreación Medieval</p>
        <p className="text-slate-500 max-w-xl mx-auto mb-10">
          Una compañía de aventureros unidos por la camaradería, el honor y la pasión por el juego de rol en vivo.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to={ROUTES.LOGIN}
            className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium transition-colors border border-amber-500"
          >
            Acceder al Archivo →
          </Link>
          <a
            href="#about"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3 rounded-lg font-medium transition-colors border border-slate-700"
          >
            Conocer más
          </a>
        </div>
      </section>

      {/* Decorative divider */}
      <div className="border-t border-slate-800 max-w-6xl mx-auto" />

      {/* About */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-serif text-amber-200 mb-12 text-center">¿Quiénes somos?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '⚔️', title: 'Rol en Vivo', desc: 'Vivimos aventuras en primera persona, interpretando personajes en escenarios reales con combate seguro y narrativa inmersiva.' },
            { icon: '🛡️', title: 'Compañía unida', desc: 'Somos una asociación donde la camaradería y el respeto son tan importantes como la habilidad en el campo de batalla.' },
            { icon: '📜', title: 'Lore propio', desc: 'Hemos construido un mundo propio con historia, facciones, enemigos y crónicas que enriquecen cada partida.' },
          ].map((item) => (
            <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-lg font-serif text-amber-200 mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800 max-w-6xl mx-auto" />

      {/* Activities */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-serif text-amber-200 mb-12 text-center">Actividades</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: '🏟️', title: 'Entrenamientos', desc: 'Sesiones regulares de combate con armas de seguridad, técnica y trabajo en equipo.' },
            { icon: '🎭', title: 'Partidas de rol en vivo', desc: 'Eventos de inmersión donde los personajes cobran vida en escenarios preparados.' },
            { icon: '🏰', title: 'Ferias medievales', desc: 'Participación en ferias y eventos de recreación histórica medieval.' },
            { icon: '🤝', title: 'Actividades sociales', desc: 'Reuniones, celebraciones y actividades para fortalecer los lazos de la compañía.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 items-start bg-slate-900/50 border border-slate-800 rounded-lg p-5">
              <span className="text-3xl shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-amber-100 mb-1">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800 max-w-6xl mx-auto" />

      {/* Contact */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-serif text-amber-200 mb-4">Contacto</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">
          ¿Quieres saber más sobre Aries Ferrus o unirte a la compañía? Ponte en contacto con nosotros.
        </p>
        <a
          href="mailto:contacto@ariesferrus.local"
          className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          contacto@ariesferrus.local
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-slate-600 text-sm">
          <p>🐐 Aries Ferrus — Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}
