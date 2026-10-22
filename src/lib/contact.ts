// Where people can reach out for the full (API-powered) version.
export const CONTACT = {
  name: 'Theo',
  email: 'theok1384@gmail.com',
  linkedin: 'https://www.linkedin.com/in/theoklk4/',
};

export const mailtoFullVersion = (app: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(`Full version of ${app}`)}&body=${encodeURIComponent(
    `Hi ${CONTACT.name},\n\nI tried the ${app} demo and I'd like to see the full version.\n\n`,
  )}`;
