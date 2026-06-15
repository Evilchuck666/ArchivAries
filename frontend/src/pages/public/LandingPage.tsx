import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../router/routes';

export function LandingPage() {
  const { t } = useTranslation('common');

  const aboutItems = [
    { icon: '⚔️', title: t('landing.about_larp_title'), desc: t('landing.about_larp_desc') },
    { icon: '🛡️', title: t('landing.about_unity_title'), desc: t('landing.about_unity_desc') },
    { icon: '📜', title: t('landing.about_lore_title'), desc: t('landing.about_lore_desc') },
  ];

  const activityItems = [
    { icon: '🏟️', title: t('landing.trainings_title'), desc: t('landing.trainings_desc') },
    { icon: '🎭', title: t('landing.larp_games_title'), desc: t('landing.larp_games_desc') },
    { icon: '🏰', title: t('landing.fairs_title'), desc: t('landing.fairs_desc') },
    { icon: '🤝', title: t('landing.social_title'), desc: t('landing.social_desc') },
  ];

  return (
    <div className="text-slate-200">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <span className="text-7xl mb-6 block">🐐</span>
        <h1 className="text-5xl md:text-6xl font-serif text-amber-200 mb-4">{t('app_name')}</h1>
        <p className="text-xl text-slate-400 mb-3">{t('landing.company_description')}</p>
        <p className="text-slate-500 max-w-xl mx-auto mb-10">{t('landing.hero_description')}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to={ROUTES.LOGIN}
            className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg font-medium transition-colors border border-amber-500"
          >
            {t('landing.login_button')}
          </Link>
          <a
            href="#about"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3 rounded-lg font-medium transition-colors border border-slate-700"
          >
            {t('landing.learn_more')}
          </a>
        </div>
      </section>

      <div className="border-t border-slate-800 max-w-6xl mx-auto" />

      {/* About */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-serif text-amber-200 mb-12 text-center">{t('landing.about_title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {aboutItems.map((item) => (
            <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-lg font-serif text-amber-200 mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-slate-800 max-w-6xl mx-auto" />

      {/* Activities */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-serif text-amber-200 mb-12 text-center">{t('landing.activities_title')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {activityItems.map((item) => (
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

      <div className="border-t border-slate-800 max-w-6xl mx-auto" />

      {/* Contact */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-serif text-amber-200 mb-4">{t('landing.contact_title')}</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">{t('landing.contact_desc')}</p>
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
          <p>{t('landing.footer_copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
