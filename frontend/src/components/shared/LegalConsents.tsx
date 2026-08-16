type LegalConsentsProps = {
  tone?: 'light' | 'dark';
  linksDisabled?: boolean;
  size?: 'default' | 'large';
};

export default function LegalConsents({ tone = 'light', linksDisabled = false, size = 'default' }: LegalConsentsProps) {
  const className = [
    'legal-consents',
    tone === 'dark' ? 'legal-consents--dark' : '',
    linksDisabled ? 'legal-consents--static' : '',
    size === 'large' ? 'legal-consents--large' : '',
  ].filter(Boolean).join(' ');

  const renderLink = (href: string, text: string) => (
    linksDisabled ? (
      <span className="legal-consents__link legal-consents__link--static">
        {text}
      </span>
    ) : (
      <a className="legal-consents__link" href={href}>
        {text}
      </a>
    )
  );

  return (
    <div className={className}>
      <label className="legal-consents__item">
        <input className="legal-consents__checkbox" type="checkbox" />
        <span className="legal-consents__text">
          Соглашаюсь с{' '}
          {renderLink('/privacy', 'политикой обработки персональных данных')}
        </span>
      </label>
      <label className="legal-consents__item">
        <input className="legal-consents__checkbox" type="checkbox" />
        <span className="legal-consents__text">
          Даю согласие на{' '}
          {renderLink('/soglasie-na-obrabotku-personalnyh-dannyh', 'обработку персональных данных')}
        </span>
      </label>
    </div>
  );
}
