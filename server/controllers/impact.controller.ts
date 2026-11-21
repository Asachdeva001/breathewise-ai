import { Request, Response, NextFunction } from 'express';
import { getUserActions, logSustainabilityAction } from '../services/firestoreService.js';
import { aggregateImpact, calculateInhaledDoseAvoided, calculateTransitSavings } from '../engine/impactEngine.js';
import { ActionLog, CommuteMode } from '../../shared/types.js';

export async function getImpact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'default_user';
    const actions = await getUserActions(userId);
    const summary = aggregateImpact(userId, actions);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function recordAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, actionType, title, distanceKm, baselineMode, alternativeMode, ambientPm25, durationHours } = req.body;

    const uid = userId || 'default_user';
    let avoidedCo2Kg = 0;
    let avoidedPm25Ug = 0;
    let calculationBasis = 'Self-reported sustainable action';

    if (actionType === 'transit_shift' && distanceKm && baselineMode && alternativeMode) {
      const savings = calculateTransitSavings({
        distanceKm: Number(distanceKm),
        baselineMode: baselineMode as CommuteMode,
        alternativeMode: alternativeMode as CommuteMode,
      });
      avoidedCo2Kg = savings.avoidedCo2Kg;
      // Convert tailpipe g PM2.5 to µg personal exposure prevention equivalent (1g = 1,000,000 µg)
      avoidedPm25Ug = savings.avoidedPm25Grams * 1000;
      calculationBasis = savings.calculationBasis;
    } else if (actionType === 'mask_usage' || actionType === 'indoor_hack') {
      const pm = Number(ambientPm25) || 250;
      const hours = Number(durationHours) || 3;
      const dose = calculateInhaledDoseAvoided({
        ambientPm25UgM3: pm,
        filtrationType: actionType === 'mask_usage' ? 'n95_mask' : 'diy_box_fan',
        durationHours: hours,
        activityLevel: 'moderate_walking',
      });
      avoidedPm25Ug = dose.avoidedPm25Ug;
      calculationBasis = dose.calculationBasis;
    } else {
      avoidedCo2Kg = 1.5;
      avoidedPm25Ug = 250;
      calculationBasis = 'Standard localized emission avoided basis';
    }

    const action: ActionLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: uid,
      actionType,
      title: title || 'Completed Sustainable Action',
      avoidedCo2Kg,
      avoidedPm25Ug,
      timestamp: new Date().toISOString(),
      calculationBasis,
    };

    const saved = await logSustainabilityAction(action);
    const allActions = await getUserActions(uid);
    const updatedSummary = aggregateImpact(uid, allActions);

    res.status(201).json({
      action: saved,
      summary: updatedSummary,
    });
  } catch (error) {
    next(error);
  }
}
