import prisma from '../../lib/prisma';
import { NotFoundError, BusinessRuleError } from '../../common/errors';
import { Prisma } from '@prisma/client';

export const createProfile = async (data: any) => {
  return prisma.shippingProfile.create({ data });
};

export const getProfiles = async () => {
  return prisma.shippingProfile.findMany({ include: { rules: true } });
};

export const getProfile = async (id: string) => {
  const profile = await prisma.shippingProfile.findUnique({
    where: { id },
    include: { rules: true },
  });
  if (!profile) throw new NotFoundError('Shipping Profile not found');
  return profile;
};

export const updateProfile = async (id: string, data: any) => {
  return prisma.shippingProfile.update({
    where: { id },
    data,
  });
};

export const deactivateProfile = async (id: string) => {
  return prisma.shippingProfile.update({
    where: { id },
    data: { isActive: false },
  });
};

export const createRule = async (profileId: string, data: any) => {
  return prisma.shippingRule.create({
    data: { ...data, shippingProfileId: profileId },
  });
};

export const calculateShipping = async (data: any) => {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    include: { shippingProfile: { include: { rules: { where: { isActive: true } } } } },
  });

  if (!product) throw new NotFoundError('Product not found');
  
  const profile = product.shippingProfile;
  if (!profile) throw new BusinessRuleError('PRODUCT_HAS_NO_SHIPPING_PROFILE', 'The selected product does not have a shipping profile.');
  if (!profile.isActive) throw new BusinessRuleError('INACTIVE_SHIPPING_PROFILE', 'The selected product shipping profile is inactive.');

  const weight = data.weight ?? (product.defaultWeight ? Number(product.defaultWeight) : null);
  const length = data.length ?? (product.defaultLength ? Number(product.defaultLength) : null);
  const width = data.width ?? (product.defaultWidth ? Number(product.defaultWidth) : null);
  const height = data.height ?? (product.defaultHeight ? Number(product.defaultHeight) : null);
  const volume = (length && width && height) ? length * width * height : null;
  const area = (length && width) ? length * width : null;

  const inputs: Record<string, number | null> = {
    WEIGHT: weight,
    QUANTITY: data.quantity,
    PRICE: Number(product.price) * data.quantity,
    DISTANCE: data.distance ?? null,
    LENGTH: length,
    WIDTH: width,
    HEIGHT: height,
    VOLUME: volume,
    AREA: area,
  };

  let subtotal = 0;
  const appliedRules = [];

  for (const rule of profile.rules) {
    const inputVal = inputs[rule.metric];
    if (inputVal === null || inputVal === undefined) continue;

    let charge = 0;
    let applicable = false;

    if (rule.calculationType === 'FLAT') {
      applicable = true;
      charge = Number(rule.fixedCharge || 0);
    } else if (rule.calculationType === 'PER_UNIT') {
      applicable = true;
      charge = Number(rule.rate || 0) * inputVal;
    } else if (rule.calculationType === 'SLAB') {
      const min = rule.minValue ? Number(rule.minValue) : 0;
      const max = rule.maxValue ? Number(rule.maxValue) : Infinity;
      if (inputVal >= min && inputVal < max) {
        applicable = true;
        charge = Number(rule.fixedCharge || 0) + (Number(rule.rate || 0) * inputVal);
      }
    } else if (rule.calculationType === 'PERCENTAGE') {
      applicable = true;
      charge = (Number(rule.rate || 0) / 100) * inputVal;
    }

    if (applicable) {
      subtotal += charge;
      appliedRules.push({
        metric: rule.metric,
        calculationType: rule.calculationType,
        input: inputVal.toFixed(2),
        charge: charge.toFixed(2),
      });
    }
  }

  let total = subtotal;
  let minimumAdjustment = 0;
  let maximumAdjustment = 0;

  if (profile.minimumCharge && total < Number(profile.minimumCharge)) {
    minimumAdjustment = Number(profile.minimumCharge) - total;
    total = Number(profile.minimumCharge);
  }

  if (profile.maximumCharge && total > Number(profile.maximumCharge)) {
    maximumAdjustment = total - Number(profile.maximumCharge);
    total = Number(profile.maximumCharge);
  }

  return {
    productId: product.id,
    shippingProfileId: profile.id,
    currency: 'INR',
    inputs: {
      quantity: data.quantity,
      distance: data.distance ? data.distance.toFixed(2) : undefined,
      weight: weight ? weight.toFixed(2) : undefined,
    },
    rules: appliedRules,
    subtotal: subtotal.toFixed(2),
    minimumAdjustment: minimumAdjustment.toFixed(2),
    maximumAdjustment: maximumAdjustment.toFixed(2),
    total: total.toFixed(2),
  };
};