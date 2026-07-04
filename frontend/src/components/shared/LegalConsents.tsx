type LegalConsentsProps = {
  tone?: 'light' | 'dark';
};

export default function LegalConsents({ tone = 'light' }: LegalConsentsProps) {
  const className = tone === 'dark' ? 'legal-consents legal-consents--dark' : 'legal-consents';

  return (
    <div className={className}>
      <label className="legal-consents__item">
        <input className="legal-consents__checkbox" type="checkbox" />
        <span className="legal-consents__text">
          Соглашаюсь с{' '}
          <a className="legal-consents__link" href="/privacy">
            политикой обработки персональных данных
          </a>
        </span>
      </label>
      <label className="legal-consents__item">
        <input className="legal-consents__checkbox" type="checkbox" />
        <span className="legal-consents__text">
          Даю согласие на{' '}
          <a className="legal-consents__link" href="/soglasie-na-obrabotku-personalnyh-dannyh">
            обработку персональных данных
          </a>
        </span>
      </label>
    </div>
  );
}
