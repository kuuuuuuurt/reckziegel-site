// Publications listed in the right column of the home page, beneath
// Selected Work. URLs default to '#' as placeholders — drop in real
// links when you have them. (Each entry is its own line, no detail
// page, just a clickable item.)

export interface Publication {
  title: string;
  venue: string;
  url: string;
}

export const publications: Publication[] = [
  {
    title: 'Perspicacity',
    venue: 'Substack',
    url: 'https://perspicacity.reckziegel.me/',
  },
  {
    title: "KIT: Kurt's Insights Toolkit",
    venue: 'Airtable',
    url: 'https://airtable.com/appIde5raPb6kRkcv/shryTyTmrvfo6TNef/tbl8Fs3CyYtaO6b5q',
  },
  {
    title: 'The Wild World of Crossword Data',
    venue: 'Towards Data Science',
    url: 'https://medium.com/data-science/the-wild-world-of-crossword-data-71d560e222f5',
  },
  {
    title: 'VIRTUE_Signals_Vol_01_Health',
    venue: 'Virtue Worldwide, VICE Media',
    url: 'https://archive.org/details/virtue_signals_vol_01_health/',
  },
  {
    title: 'Early Draught',
    venue: 'Substack',
    url: 'https://earlydraught.substack.com/',
  },
];
