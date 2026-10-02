import { submitExercise } from './exercises.service';
import { Request, Response } from 'express';

/** Controller wrapper – currently the service does all logic. */
export async function handleSubmitExercise(req: Request, res: Response) {
  // Delegates to the service implementation.
  return submitExercise(req, res);
}
