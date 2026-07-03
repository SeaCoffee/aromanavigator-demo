const base =
  'inline-flex items-center justify-center gap-2 text-center text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b98d6d]/20 disabled:cursor-not-allowed disabled:opacity-60';

const regular = 'min-h-11 rounded-[16px] px-5 py-2';
const compact = 'min-h-9 rounded-md px-3 py-1.5 text-xs';
const listing = 'min-h-10 rounded-md px-4 py-2 text-sm';
const listingCompact = 'min-h-9 rounded-md px-3 py-1.5 text-sm';

const primaryPalette =
  'border border-transparent bg-[#9b6847] !text-white shadow-[0_14px_30px_rgba(130,83,50,0.20)] hover:bg-[#875538]';
const secondaryPalette =
  'border border-[#e0d2c5] bg-white text-[#3c322d] shadow-[0_10px_24px_rgba(94,72,54,0.05)] hover:border-[#b98d6d] hover:bg-[#f6efe8] hover:text-[#7a4f35]';
const dangerPalette =
  'border border-red-200 bg-white text-red-700 shadow-[0_10px_24px_rgba(127,29,29,0.04)] hover:border-red-300 hover:bg-red-50';
const selectedPalette =
  'border border-[#641f32] bg-[#641f32] !text-white shadow-[0_14px_30px_rgba(100,31,50,0.18)] hover:bg-[#7a2940]';

export const buttonStyles = {
  base,
  regular,
  compact,
  listing,
  listingCompact,

  primaryPalette,
  secondaryPalette,
  dangerPalette,
  selectedPalette,

  primary: `${base} ${regular} ${primaryPalette}`,
  secondary: `${base} ${regular} ${secondaryPalette}`,
  danger: `${base} ${regular} ${dangerPalette}`,
  selected: `${base} ${regular} ${selectedPalette}`,

  compactPrimary: `${base} ${compact} ${primaryPalette}`,
  compactSecondary: `${base} ${compact} ${secondaryPalette}`,
  compactDanger: `${base} ${compact} ${dangerPalette}`,
  listingPrimary: `${base} ${listing} ${primaryPalette}`,
  listingSecondary: `${base} ${listing} ${secondaryPalette}`,
  listingDanger: `${base} ${listing} ${dangerPalette}`,
  listingCompactPrimary: `${base} ${listingCompact} ${primaryPalette}`,
  listingCompactSecondary: `${base} ${listingCompact} ${secondaryPalette}`,
  listingCompactDanger: `${base} ${listingCompact} ${dangerPalette}`,

  icon:
    'grid size-10 place-items-center rounded-[14px] border border-[#e0d2c5] bg-white text-[#3c322d] shadow-[0_10px_24px_rgba(94,72,54,0.05)] transition hover:border-[#b98d6d] hover:bg-[#f6efe8] hover:text-[#7a4f35] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b98d6d]/20 disabled:cursor-not-allowed disabled:opacity-60',
  iconSelected:
    'grid size-10 place-items-center rounded-[14px] border border-[#641f32] bg-[#641f32] text-[#fff8f1] shadow-[0_14px_30px_rgba(100,31,50,0.18)] transition hover:bg-[#7a2940] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b98d6d]/20 disabled:cursor-not-allowed disabled:opacity-60',
  iconDanger:
    'grid size-9 place-items-center rounded-full border border-transparent text-red-700 transition hover:border-red-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60',
  iconQuiet:
    'grid size-9 place-items-center rounded-full border border-transparent text-[#7a6d64] transition hover:border-[#e0d2c5] hover:bg-[#f6efe8] hover:text-[#7a4f35] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b98d6d]/20 disabled:cursor-not-allowed disabled:opacity-60',

  filePicker:
    'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[16px] border border-[#e2d2c4] bg-[#f1e4db] px-4 py-2 text-sm font-black text-[#641f32] transition hover:border-[#caa98f] hover:bg-[#ead8cb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b98d6d]/20',
  fileInput:
    'block w-full rounded-[16px] border border-[#e0d2c5] bg-white px-3 py-2 text-sm font-medium text-[#6f6258] file:mr-4 file:cursor-pointer file:rounded-[14px] file:border file:border-[#e2d2c4] file:bg-[#f1e4db] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#641f32] hover:file:border-[#caa98f] hover:file:bg-[#ead8cb] disabled:cursor-not-allowed disabled:opacity-60',
  compactSelected: `${base} ${compact} ${selectedPalette}`,
} as const;
