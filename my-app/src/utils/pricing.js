export const getVisitingCharge = (item = {}) => {
  const rawCharge =
    item?.visitingCharge ??
    item?.minimumVisitCharge ??
    item?.price ??
    item?.serviceCharge ??
    0;

  const numericCharge = Number(rawCharge);
  return Number.isFinite(numericCharge) ? numericCharge : 0;
};

