/**
 * Curated dataset of major Central Government welfare schemes.
 * Each scheme carries structured eligibility criteria used by the
 * deterministic matching engine (lib/match.js). The AI layer then
 * personalises guidance for the matched schemes.
 *
 * NOTE: Benefit amounts / rules evolve. Users are always shown the
 * official portal link and a "verify before applying" disclaimer.
 */

export const SCHEMES = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    benefit: "₹6,000 per year income support (3 instalments) for landholding farmer families",
    sector: "Agriculture",
    link: "https://pmkisan.gov.in",
    documents: ["Aadhaar", "Land ownership records", "Bank account (Aadhaar-seeded)"],
    criteria: { occupations: ["farmer"], minAge: 18 }
  },
  {
    id: "pm-jay",
    name: "Ayushman Bharat PM-JAY",
    benefit: "Health cover of ₹5 lakh per family per year for secondary & tertiary hospitalisation",
    sector: "Health",
    link: "https://beneficiary.nha.gov.in",
    documents: ["Aadhaar", "Ration card / family ID"],
    criteria: { maxIncome: 300000 }
  },
  {
    id: "pmay-g",
    name: "PM Awas Yojana – Gramin",
    benefit: "Financial assistance (~₹1.2 lakh in plains) to build a pucca house in rural areas",
    sector: "Housing",
    link: "https://pmayg.nic.in",
    documents: ["Aadhaar", "Bank account", "Job card (MGNREGA, if any)"],
    criteria: { residence: "rural", maxIncome: 200000, minAge: 18 }
  },
  {
    id: "pmay-u",
    name: "PM Awas Yojana – Urban",
    benefit: "Housing assistance / interest subsidy for EWS & LIG families in urban areas",
    sector: "Housing",
    link: "https://pmay-urban.gov.in",
    documents: ["Aadhaar", "Income certificate", "Bank account"],
    criteria: { residence: "urban", maxIncome: 600000, minAge: 18 }
  },
  {
    id: "sukanya",
    name: "Sukanya Samriddhi Yojana",
    benefit: "High-interest savings account for a girl child below 10 years; tax-free maturity",
    sector: "Girl Child",
    link: "https://www.india.gov.in/spotlight/sukanya-samriddhi-yojana",
    documents: ["Girl child's birth certificate", "Guardian Aadhaar/PAN"],
    criteria: { girlChild: true }
  },
  {
    id: "ujjwala",
    name: "PM Ujjwala Yojana",
    benefit: "Free LPG connection with first refill & stove support for women from poor households",
    sector: "Energy / Women",
    link: "https://www.pmuy.gov.in",
    documents: ["Aadhaar", "Ration card", "Bank account"],
    criteria: { gender: "female", minAge: 18, maxIncome: 200000 }
  },
  {
    id: "ignoaps",
    name: "Indira Gandhi National Old Age Pension",
    benefit: "Monthly pension (₹200–₹500 central share + state top-up) for BPL senior citizens",
    sector: "Pension",
    link: "https://nsap.nic.in",
    documents: ["Aadhaar", "Age proof", "BPL card", "Bank account"],
    criteria: { minAge: 60, maxIncome: 100000 }
  },
  {
    id: "igndps",
    name: "Indira Gandhi National Disability Pension",
    benefit: "Monthly pension for persons with severe disability (80%+) from BPL households",
    sector: "Pension / Disability",
    link: "https://nsap.nic.in",
    documents: ["Disability certificate", "Aadhaar", "BPL card"],
    criteria: { disability: true, minAge: 18, maxAge: 79, maxIncome: 100000 }
  },
  {
    id: "ignwps",
    name: "Indira Gandhi National Widow Pension",
    benefit: "Monthly pension for widows aged 40–79 from BPL households",
    sector: "Pension / Women",
    link: "https://nsap.nic.in",
    documents: ["Husband's death certificate", "Aadhaar", "BPL card"],
    criteria: { maritalStatus: "widowed", gender: "female", minAge: 40, maxAge: 79, maxIncome: 100000 }
  },
  {
    id: "vishwakarma",
    name: "PM Vishwakarma",
    benefit: "₹15,000 toolkit incentive + collateral-free loans up to ₹3 lakh at 5% for traditional artisans",
    sector: "Artisans / Livelihood",
    link: "https://pmvishwakarma.gov.in",
    documents: ["Aadhaar", "Bank account", "Proof of trade"],
    criteria: { occupations: ["artisan"], minAge: 18 }
  },
  {
    id: "mudra",
    name: "PM Mudra Yojana",
    benefit: "Collateral-free business loans up to ₹20 lakh for micro & small enterprises",
    sector: "Entrepreneurship",
    link: "https://www.mudra.org.in",
    documents: ["Aadhaar", "Business plan / proof", "Bank account"],
    criteria: { occupations: ["self-employed", "artisan", "street-vendor", "unemployed"], minAge: 18 }
  },
  {
    id: "standup",
    name: "Stand-Up India",
    benefit: "Bank loans ₹10 lakh–₹1 crore for SC/ST and women entrepreneurs setting up greenfield enterprises",
    sector: "Entrepreneurship",
    link: "https://www.standupmitra.in",
    documents: ["Aadhaar", "Caste certificate (if SC/ST)", "Project report"],
    criteria: { minAge: 18, anyOf: [{ categories: ["sc", "st"] }, { gender: "female" }] }
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana",
    benefit: "Subsidised crop insurance against natural calamities, pests & diseases",
    sector: "Agriculture",
    link: "https://pmfby.gov.in",
    documents: ["Aadhaar", "Land records / sowing certificate", "Bank account"],
    criteria: { occupations: ["farmer"], minAge: 18 }
  },
  {
    id: "apy",
    name: "Atal Pension Yojana",
    benefit: "Guaranteed pension of ₹1,000–₹5,000/month after 60 for unorganised-sector workers",
    sector: "Pension",
    link: "https://www.npscra.nsdl.co.in/scheme-details.php",
    documents: ["Aadhaar", "Savings bank account"],
    criteria: { minAge: 18, maxAge: 40, occupations: ["farmer", "daily-wage", "street-vendor", "artisan", "self-employed", "homemaker", "unemployed"] }
  },
  {
    id: "pmjjby",
    name: "PM Jeevan Jyoti Bima Yojana",
    benefit: "₹2 lakh life insurance cover at ₹436/year premium",
    sector: "Insurance",
    link: "https://www.jansuraksha.gov.in",
    documents: ["Aadhaar", "Bank account with auto-debit consent"],
    criteria: { minAge: 18, maxAge: 50 }
  },
  {
    id: "pmsby",
    name: "PM Suraksha Bima Yojana",
    benefit: "₹2 lakh accidental death & disability cover at just ₹20/year",
    sector: "Insurance",
    link: "https://www.jansuraksha.gov.in",
    documents: ["Aadhaar", "Bank account with auto-debit consent"],
    criteria: { minAge: 18, maxAge: 70 }
  },
  {
    id: "svanidhi",
    name: "PM SVANidhi",
    benefit: "Collateral-free working capital loans (₹10k → ₹50k ladder) for street vendors + cashback on digital payments",
    sector: "Livelihood",
    link: "https://pmsvanidhi.mohua.gov.in",
    documents: ["Vending certificate / LoR from ULB", "Aadhaar", "Bank account"],
    criteria: { occupations: ["street-vendor"], minAge: 18 }
  },
  {
    id: "kcc",
    name: "Kisan Credit Card",
    benefit: "Low-interest crop & allied-activity credit up to ₹5 lakh for farmers",
    sector: "Agriculture",
    link: "https://www.myscheme.gov.in/schemes/kcc",
    documents: ["Aadhaar", "Land records", "Bank account"],
    criteria: { occupations: ["farmer"], minAge: 18, maxAge: 75 }
  },
  {
    id: "pmmvy",
    name: "PM Matru Vandana Yojana",
    benefit: "₹5,000 cash incentive for pregnant women & lactating mothers (first child)",
    sector: "Women & Child",
    link: "https://pmmvy.wcd.gov.in",
    documents: ["Aadhaar", "MCP card", "Bank account"],
    criteria: { gender: "female", motherhood: true, minAge: 18 }
  },
  {
    id: "nsp-postmatric",
    name: "Post-Matric Scholarships (NSP)",
    benefit: "Scholarships for SC/ST/OBC/minority students studying class 11 and above",
    sector: "Education",
    link: "https://scholarships.gov.in",
    documents: ["Caste certificate", "Income certificate", "Previous marksheets", "Bank account"],
    criteria: { studentOnly: true, categories: ["sc", "st", "obc"], maxIncome: 250000 }
  },
  {
    id: "pmkvy",
    name: "PM Kaushal Vikas Yojana (Skill India)",
    benefit: "Free, certified short-term skill training with placement assistance",
    sector: "Skilling",
    link: "https://www.pmkvyofficial.org",
    documents: ["Aadhaar", "Bank account"],
    criteria: { minAge: 15, maxAge: 45, occupations: ["student", "unemployed", "daily-wage", "homemaker"] }
  }
];
