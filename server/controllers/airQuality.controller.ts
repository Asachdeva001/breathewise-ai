import { Request, Response, NextFunction } from 'express';
import { fetchAirQuality } from '../services/aqiService.js';

export async function getAirQuality(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const city = (req.query.city as string) || 'New Delhi';
    const isDemo = req.query.demo === 'true';
    const scenario = req.query.scenario as string | undefined;

    const telemetry = await fetchAirQuality(city, isDemo, scenario);
    res.json(telemetry);
  } catch (error) {
    next(error);
  }
}
