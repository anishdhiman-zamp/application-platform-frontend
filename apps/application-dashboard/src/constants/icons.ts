// ImageKit.io configuration
export const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? '';

// For backward compatibility and fallback to local assets
export const IMAGE_PREFIX = IMAGEKIT_URL_ENDPOINT || '';

// Utility function for CSS background images
export const getBackgroundImageUrl = (path: string): string => {
  // Remove leading slash and /public prefix for ImageKit
  const cleanPath = path.replace(/^\/public/, '').replace(/^\//, '');

  if (IMAGEKIT_URL_ENDPOINT) {
    return `url(${IMAGEKIT_URL_ENDPOINT}/${cleanPath})`;
  }

  // Fallback to local assets
  const publicPath = path.startsWith('/public') ? path : `/public${path}`;

  return `url(${publicPath})`;
};

// Utility function for getting asset URLs (for src attributes, etc.)
export const getAssetUrl = (path: string): string => {
  // Remove leading slash and /public prefix for ImageKit
  const cleanPath = path.replace(/^\/public/, '').replace(/^\//, '');

  if (IMAGEKIT_URL_ENDPOINT) {
    return `${IMAGEKIT_URL_ENDPOINT}/${cleanPath}`;
  }

  // Fallback to local assets
  const publicPath = path.startsWith('/public') ? path : `/public${path}`;

  return publicPath;
};

export const ZAMP_ICON = IMAGE_PREFIX + '/icons/zamp-icon.svg';
export const FAVICON = IMAGE_PREFIX + '/icons/favicon.png';
export const NOTEBOOK_ICON = IMAGE_PREFIX + '/icons/notebook.svg';
export const GLOBE_ICON = IMAGE_PREFIX + '/icons/globe-01.svg';
export const ZAMP_ICON_BLACK = IMAGE_PREFIX + '/icons/zamp-icon-black.svg';
export const GOOGLE_ICON = IMAGE_PREFIX + '/icons/google.svg';
export const DRAG_ICON = IMAGE_PREFIX + '/icons/drag-icon.svg';
export const ERROR_WITH_BORDER = IMAGE_PREFIX + '/icons/error-with-border.svg';
export const RULE_ICON = IMAGE_PREFIX + '/icons/rule.svg';
export const JOINED_DATASET_ICON = IMAGE_PREFIX + '/icons/joined-dataset.svg';
export const ZAMP_LOGIN_BG = IMAGE_PREFIX + '/mp4/zamp-login-bg.mp4';
export const ZAMP_FULL_LOGO = IMAGE_PREFIX + '/icons/zamp-full-logo.svg';
export const COINS_STACKED_05 = IMAGE_PREFIX + '/icons/coins-stacked-05.svg';
export const PIVOT_HEADER_BG = IMAGE_PREFIX + '/images/pivot-header-bg.svg';
export const ARROW_RIGHT = IMAGE_PREFIX + '/icons/arrow-right.svg';
export const CHEVRON_DOWN = IMAGE_PREFIX + '/icons/chevron-down.svg';
export const CHEVRON_RIGHT = IMAGE_PREFIX + '/icons/chevron-right.svg';
export const DISABLED_CHEVRON_RIGHT = IMAGE_PREFIX + '/icons/disabled-chevron-right.svg';
export const RED_ALERT_ICON = IMAGE_PREFIX + '/icons/red-alert-circle.svg';
export const GREEN_CHECK_ICON = IMAGE_PREFIX + '/icons/green-check-circle.svg';
export const SCREEN_SUPPORT = IMAGE_PREFIX + '/images/screen-support.svg';
export const DATASET_ICON = IMAGE_PREFIX + '/icons/dataset.svg';
export const GROUP_EXPAND_ICON = IMAGE_PREFIX + '/icons/group-expand.svg';
export const GROUP_COLLAPSE_ICON = IMAGE_PREFIX + '/icons/group-collapse.svg';
export const CONNECT_ACCOUNT = IMAGE_PREFIX + '/images/connect-account.svg';
export const DATASET_TABLE = IMAGE_PREFIX + '/icons/dataset-table.svg';
export const ALIGN_CENTER = IMAGE_PREFIX + '/icons/align-center.svg';
export const KNOWLEDGE_BASED = IMAGE_PREFIX + '/icons/knowledge-based.svg';
export const DONUT_CHART_ICON = IMAGE_PREFIX + '/icons/donut.svg';

// Bank Icons
export const ADCB_SVG = IMAGE_PREFIX + '/icons/bank-icons/adcb.svg';
export const ADYEN = IMAGE_PREFIX + '/icons/bank-icons/adyen.png';
export const AFTERPAY = IMAGE_PREFIX + '/icons/bank-icons/afterpay.svg';
export const ALRAJI_SVG = IMAGE_PREFIX + '/icons/bank-icons/alraji.svg';
export const AMERICAN_EXPRESS = IMAGE_PREFIX + '/icons/bank-icons/american-express.svg';
export const AMEX = IMAGE_PREFIX + '/icons/bank-icons/amex.svg';
export const ANB_SA = IMAGE_PREFIX + '/icons/bank-icons/anb_sa.svg';
export const APPLE_PAY = IMAGE_PREFIX + '/icons/bank-icons/apple-pay.svg';
export const ARB_SA = IMAGE_PREFIX + '/icons/bank-icons/arb_sa.svg';
export const ASPIRE_PNG = IMAGE_PREFIX + '/icons/bank-icons/aspirelogo.png';
export const AXIS_IND = IMAGE_PREFIX + '/icons/bank-icons/axis-bank.svg';
export const BAB_KSA = IMAGE_PREFIX + '/icons/bank-icons/al-bilad.png';
export const BAE_JOR = IMAGE_PREFIX + '/icons/bank-icons/bank-al-etihad-logo.jpg';
export const BANKING_CIRCLE = IMAGE_PREFIX + '/icons/bank-icons/banking-circle.svg';
export const BARCLAYS = IMAGE_PREFIX + '/icons/bank-icons/barclays.svg';
export const BMO = IMAGE_PREFIX + '/icons/bank-icons/bmo.svg';
export const BLOOM_BANK = IMAGE_PREFIX + '/icons/bank-icons/blom-bank.jpeg';
export const BNY_PNG = IMAGE_PREFIX + '/icons/bank-icons/bnylogo.png';
export const BNQMISR_EG = IMAGE_PREFIX + '/icons/bank-icons/bnqmisr.svg';
export const BOB_IRQ = IMAGE_PREFIX + '/icons/bank-icons/bob.jpg';
export const BOP_PSE = IMAGE_PREFIX + '/icons/bank-icons/bank-of-palestine.jpg';
export const CASH_APP = IMAGE_PREFIX + '/icons/bank-icons/cash-app.svg';
export const CITI_BANK = IMAGE_PREFIX + '/icons/bank-icons/citi.svg';
export const CHASE_SVG = IMAGE_PREFIX + '/icons/bank-icons/chase.svg';
export const CHECKOUT = IMAGE_PREFIX + '/icons/bank-icons/checkout.svg';
export const CIB_EG = IMAGE_PREFIX + '/icons/bank-icons/cib.svg';
export const CLEARWATER = IMAGE_PREFIX + '/icons/bank-icons/clearwater.png';
export const CREDIT_CARD = IMAGE_PREFIX + '/icons/bank-icons/credit-card.svg';
export const CROSSRIVER = IMAGE_PREFIX + '/icons/bank-icons/crossriver.svg';
export const DEFAULT_BANK = IMAGE_PREFIX + '/icons/bank-icons/default-bank.svg';
export const DANSKE = IMAGE_PREFIX + '/icons/bank-icons/danske-bank.svg';
export const DINERS_CLUB = IMAGE_PREFIX + '/icons/bank-icons/diners-club.svg';
export const DISCOVER = IMAGE_PREFIX + '/icons/bank-icons/discover.svg';
export const ELO = IMAGE_PREFIX + '/icons/bank-icons/elo.svg';
export const ENBD_SVG = IMAGE_PREFIX + '/icons/bank-icons/enbd.svg';
export const FAB_SVG = IMAGE_PREFIX + '/icons/bank-icons/fab.svg';
export const FAB_UAE = IMAGE_PREFIX + '/icons/bank-icons/first-abu-dhabi-bank.png';
export const FB_PAK = IMAGE_PREFIX + '/icons/bank-icons/faysal.png';
export const GB_TUR = IMAGE_PREFIX + '/icons/bank-icons/garanti-bank.png';
export const GIB_SVG = IMAGE_PREFIX + '/icons/bank-icons/gib.svg';
export const HSBC_SVG = IMAGE_PREFIX + '/icons/bank-icons/hsbc.svg';
export const HDFC_SVG = IMAGE_PREFIX + '/icons/bank-icons/hdfc.svg';
export const ICICI_IN = IMAGE_PREFIX + '/icons/bank-icons/icici-bank.svg';
export const JCB = IMAGE_PREFIX + '/icons/bank-icons/jcb.svg';
export const JPM_GB = IMAGE_PREFIX + '/icons/bank-icons/jpm_gb.png';
export const JSB_PAK = IMAGE_PREFIX + '/icons/bank-icons/js_bank.png';
export const LEAD_BANK = IMAGE_PREFIX + '/icons/bank-icons/lead_bank.svg';
export const MADA = IMAGE_PREFIX + '/icons/bank-icons/mada.svg';
export const MAESTRO = IMAGE_PREFIX + '/icons/bank-icons/maestro.svg';
export const M_AND_T_BANK = IMAGE_PREFIX + '/icons/bank-icons/m_and_t_bank.svg';
export const MASHREQ_SVG = IMAGE_PREFIX + '/icons/bank-icons/mashreq.svg';
export const MASTERCARD = IMAGE_PREFIX + '/icons/bank-icons/mastercard.svg';
export const MERCURY = IMAGE_PREFIX + '/icons/bank-icons/mercury.svg';
export const NBK_KWT = IMAGE_PREFIX + '/icons/bank-icons/national-bank-of-kuwait.png';
export const NBI_KUR = IMAGE_PREFIX + '/icons/bank-icons/national-bank-of-iraq.png';
export const NO_PROCESSOR = IMAGE_PREFIX + '/icons/bank-icons/no-processor.svg';
export const OTHER_GATEWAY = IMAGE_PREFIX + '/icons/bank-icons/other-gateway.svg';
export const PAYPAL = IMAGE_PREFIX + '/icons/bank-icons/paypal.svg';
export const PASHA = IMAGE_PREFIX + '/icons/bank-icons/pasha.png';
export const QNB_QAT = IMAGE_PREFIX + '/icons/bank-icons/qatar_national_bank.png';
export const RAIFFEISEN = IMAGE_PREFIX + '/icons/bank-icons/raiffeisen.svg';
export const SBI_IN = IMAGE_PREFIX + '/icons/bank-icons/sbi-bank.svg';
export const SALLA = IMAGE_PREFIX + '/icons/bank-icons/salla.svg';
export const SNB_KSA = IMAGE_PREFIX + '/icons/bank-icons/saudi-national-bank.jpg';
export const STRIPE = IMAGE_PREFIX + '/icons/bank-icons/stripe.svg';
export const SVB_PNG = IMAGE_PREFIX + '/icons/bank-icons/svblogo.png';
export const TRISTATE = IMAGE_PREFIX + '/icons/bank-icons/tristate.svg';
export const TRUIST = IMAGE_PREFIX + '/icons/bank-icons/truist.svg';
export const TURKIYE_IS_BANKASI = IMAGE_PREFIX + '/icons/bank-icons/turkiye_is_bankasi.svg';
export const UNION_PAY = IMAGE_PREFIX + '/icons/bank-icons/union-pay.svg';
export const UNICREDIT = IMAGE_PREFIX + '/icons/bank-icons/unicredit.svg';
export const VENMO = IMAGE_PREFIX + '/icons/bank-icons/venmo.svg';
export const VISA = IMAGE_PREFIX + '/icons/bank-icons/visa.svg';
export const WILMINGTON_TRUST = IMAGE_PREFIX + '/icons/bank-icons/wilmington_trust.svg';
export const ZID = IMAGE_PREFIX + '/icons/bank-icons/zid.svg';

export const HAND_ICON = IMAGE_PREFIX + '/icons/hand.svg';
export const ADAM_ICON = IMAGE_PREFIX + '/icons/agents/adam-icon.svg';
export const ACCORDION_LIST = IMAGE_PREFIX + '/icons/agents/accordion-list.svg';
export const ACCORDION_CONTENT_BG = IMAGE_PREFIX + '/icons/agents/accordion-content-bg.svg';

//Artifacts
export const BROWSER = IMAGE_PREFIX + '/icons/agents/artifacts/browser.svg';
export const COUPA = IMAGE_PREFIX + '/icons/agents/artifacts/coupa.svg';
export const DATASET = IMAGE_PREFIX + '/icons/agents/artifacts/dataset.svg';
export const DOCUSIGN = IMAGE_PREFIX + '/icons/agents/artifacts/docu-sign.svg';
export const FILE = IMAGE_PREFIX + '/icons/agents/artifacts/file.svg';
export const GMAIL = IMAGE_PREFIX + '/icons/agents/artifacts/gmail.svg';
export const SALESFORCE = IMAGE_PREFIX + '/icons/agents/artifacts/salesforce.svg';
export const SLACK = IMAGE_PREFIX + '/icons/agents/artifacts/slack.svg';
export const VIDEO = IMAGE_PREFIX + '/icons/agents/artifacts/video.svg';
export const SPRINKLR = IMAGE_PREFIX + '/icons/agents/artifacts/sprinklr.svg';
export const REDIRECT = IMAGE_PREFIX + '/icons/agents/artifacts/redirect.svg';
export const LINK = IMAGE_PREFIX + '/icons/agents/artifacts/link.svg';
export const IMAGE = IMAGE_PREFIX + '/icons/agents/artifacts/image.svg';

export const NEEDS_ATTENTION_EMPTY_STATE = IMAGE_PREFIX + '/images/empty-state/needs-attention.webp';
export const DONE_EMPTY_STATE = IMAGE_PREFIX + '/images/empty-state/done.webp';
export const IN_PROGRESS_EMPTY_STATE = IMAGE_PREFIX + '/images/empty-state/in-progress.webp';
export const TEAM_MEMBERS_EMPTY_STATE = IMAGE_PREFIX + '/images/empty-state/team-members.webp';

export const SHEET_EMPTY_STATE = IMAGE_PREFIX + '/images/empty-state/sheet.png';

// Video Artifact
export const PAUSED_OVERLAY = IMAGE_PREFIX + '/icons/agents/video-artifact/paused-overlay.svg';
export const PLAYING = IMAGE_PREFIX + '/icons/agents/video-artifact/playing.svg';
export const PAUSED = IMAGE_PREFIX + '/icons/agents/video-artifact/paused.svg';

// knowledge based
export const KNOWLEDGE_BASED_ICON = IMAGE_PREFIX + '/images/kb-background.svg';

// feedback
export const QUEUED_ICON = IMAGE_PREFIX + '/icons/feedback/status/queued.svg';
export const FEEDBACK_SUCCESS_ICON = IMAGE_PREFIX + '/icons/feedback/status/feedback-success.svg';
export const LOADER_02 = IMAGE_PREFIX + '/icons/feedback/status/loader-02.svg';
export const MESSAGE_ICON = IMAGE_PREFIX + '/icons/feedback/message.svg';
export const PLAY_ICON = IMAGE_PREFIX + '/icons/feedback/play.svg';
export const FEEDBACK_OPEN_ICON = IMAGE_PREFIX + '/icons/feedback/feedback-open.svg';

//Loaders
export const ZAMP_LOGO_LOADER_SVG = '/loaders/zamp-logo-loader.svg';
export const WIDGET_LOADER_SVG = '/loaders/widget-loader.svg';

export const VERCEL_BLOB_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_BLOB_BASE_URL;
export const VERCEL_BLOB_ICON_URL = `${VERCEL_BLOB_BASE_URL}/icons`;

export enum SUPPORT_INFO_TYPES {
  GUIDE = 'GUIDE',
  ERROR = 'ERROR',
  CUSTOM = 'CUSTOM',
}
